const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 5000;

// Firebase Admin SDK başlatma
const serviceAccount = require('./firebaseServiceAccount.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "ayakkabi-satis-07.appspot.com"
});

const db = admin.firestore();

app.use(cors());
app.use(express.json());

// Uploads klasörüne statik erişim
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Multer konfigürasyonu - geçici dosya yükleme
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Sadece resim dosyalarını kabul et
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Sadece resim dosyaları yüklenebilir!'), false);
    }
  },
});

// Middleware - Firebase Auth token doğrulama
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// YENİ: Kullanıcı senkronizasyon endpoint'i
// Kullanıcı Firebase'e giriş yaptığında bu endpoint çağrılır.
// Kullanıcının Firestore'da kaydı yoksa oluşturur.
app.post('/api/user/sync', authenticateToken, async (req, res) => {
  try {
    const { uid } = req.user; // Token'dan gelen UID
    const { email, displayName } = req.body;

    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      // Kullanıcı Firestore'da yoksa, yeni bir belge oluştur.
      await userRef.set({
        email,
        displayName: displayName || email, // displayName yoksa email kullan
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        role: 'user' // Varsayılan rol
      });
      res.status(201).json({ message: 'User created in Firestore' });
    } else {
      // Kullanıcı zaten var.
      res.status(200).json({ message: 'User already exists' });
    }
  } catch (error) {
    console.error('User sync error:', error);
    res.status(500).json({ error: 'Failed to sync user' });
  }
});

// Kullanıcı bilgilerini getir
app.get('/api/user/:uid', authenticateToken, async (req, res) => {
  try {
    const { uid } = req.params;
    const userDoc = await db.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    
    res.json(userDoc.data());
  } catch (error) {
    console.error('Kullanıcı bilgisi getirme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Ürün endpoint'leri
app.get('/api/products', async (req, res) => {
  try {
    const { category, brand, type, minPrice, maxPrice, search } = req.query;
    
    let query = db.collection('products');
    
    // Filtreleme
    if (category && category !== 'all') {
      query = query.where('category', '==', category);
    }
    
    if (brand) {
      query = query.where('brand', '==', brand);
    }
    
    if (type) {
      query = query.where('type', '==', type);
    }
    
    if (minPrice) {
      query = query.where('price', '>=', parseFloat(minPrice));
    }
    
    if (maxPrice) {
      query = query.where('price', '<=', parseFloat(maxPrice));
    }
    
    const snapshot = await query.get();
    let products = [];
    
    snapshot.forEach(doc => {
      products.push({ id: doc.id, ...doc.data() });
    });
    
    // Arama filtrelemesi (client-side)
    if (search) {
      const searchLower = search.toLowerCase();
      products = products.filter(product => 
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower) ||
        product.brand.toLowerCase().includes(searchLower)
      );
    }
    
    res.json(products);
  } catch (error) {
    console.error('Ürün getirme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const productDoc = await db.collection('products').doc(id).get();
    
    if (!productDoc.exists) {
      return res.status(404).json({ error: 'Ürün bulunamadı' });
    }
    
    res.json({ id: productDoc.id, ...productDoc.data() });
  } catch (error) {
    console.error('Ürün detay getirme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Kategori endpoint'leri
app.get('/api/categories', async (req, res) => {
  try {
    const snapshot = await db.collection('categories').get();
    const categories = [];
    
    snapshot.forEach(doc => {
      categories.push({ id: doc.id, ...doc.data() });
    });
    
    res.json(categories);
  } catch (error) {
    console.error('Kategori getirme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Marka endpoint'leri
app.get('/api/brands', async (req, res) => {
  try {
    const snapshot = await db.collection('brands').get();
    const brands = [];
    
    snapshot.forEach(doc => {
      brands.push({ id: doc.id, ...doc.data() });
    });
    
    res.json(brands);
  } catch (error) {
    console.error('Marka getirme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Ürün türleri endpoint'i
app.get('/api/types', async (req, res) => {
  try {
    const snapshot = await db.collection('types').get();
    const types = [];
    
    snapshot.forEach(doc => {
      types.push({ id: doc.id, ...doc.data() });
    });
    
    res.json(types);
  } catch (error) {
    console.error('Tür getirme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Sepet endpoint'leri
app.post('/api/cart', authenticateToken, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.uid;
    
    const cartRef = db.collection('carts').doc(userId);
    const cartDoc = await cartRef.get();
    
    if (cartDoc.exists) {
      // Mevcut sepeti güncelle
      const cartData = cartDoc.data();
      const existingItem = cartData.items.find(item => item.productId === productId);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cartData.items.push({ productId, quantity });
      }
      
      await cartRef.update(cartData);
    } else {
      // Yeni sepet oluştur
      await cartRef.set({
        userId,
        items: [{ productId, quantity }],
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    
    res.json({ message: 'Ürün sepete eklendi' });
  } catch (error) {
    console.error('Sepet ekleme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/cart', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const cartDoc = await db.collection('carts').doc(userId).get();
    
    if (!cartDoc.exists) {
      return res.json({ items: [] });
    }
    
    const cartData = cartDoc.data();
    
    // Ürün detaylarını getir
    const itemsWithDetails = await Promise.all(
      cartData.items.map(async (item) => {
        const productDoc = await db.collection('products').doc(item.productId).get();
        return {
          ...item,
          product: productDoc.exists ? { id: productDoc.id, ...productDoc.data() } : null
        };
      })
    );
    
    res.json({ items: itemsWithDetails });
  } catch (error) {
    console.error('Sepet getirme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/cart/:productId', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.uid;
    
    const cartRef = db.collection('carts').doc(userId);
    const cartDoc = await cartRef.get();
    
    if (cartDoc.exists) {
      const cartData = cartDoc.data();
      cartData.items = cartData.items.filter(item => item.productId !== productId);
      
      await cartRef.update(cartData);
    }
    
    res.json({ message: 'Ürün sepetten kaldırıldı' });
  } catch (error) {
    console.error('Sepet silme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Sipariş endpoint'leri
app.post('/api/orders', authenticateToken, async (req, res) => {
  try {
    const { items, total, shippingAddress } = req.body;
    const userId = req.user.uid;
    
    const orderRef = await db.collection('orders').add({
      userId,
      items,
      total,
      shippingAddress,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Sepeti temizle
    await db.collection('carts').doc(userId).delete();
    
    res.status(201).json({ 
      message: 'Sipariş oluşturuldu',
      orderId: orderRef.id 
    });
  } catch (error) {
    console.error('Sipariş oluşturma hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
    console.log('Sipariş listeleme isteği alındı, kullanıcı:', req.user.uid);
    
    const userId = req.user.uid;
    // Index gerektirmeyen sorgu - sadece userId'ye göre filtreleme
    const snapshot = await db.collection('orders')
      .where('userId', '==', userId)
      .get();
    
    console.log('Siparişler bulundu:', snapshot.size);
    
    const orders = [];
    snapshot.forEach(doc => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    
    // JavaScript tarafında createdAt'e göre sıralama
    orders.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0);
      const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0);
      return dateB - dateA; // Azalan sıralama (en yeni önce)
    });
    
    console.log('Siparişler başarıyla döndürülüyor:', orders.length);
    res.json(orders);
  } catch (error) {
    console.error('Sipariş getirme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin endpoint'leri
app.get('/api/admin/stats', authenticateToken, async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    
    if (!userDoc.exists || userDoc.data().role !== 'admin') {
      return res.status(403).json({ error: 'Admin yetkisi gerekli' });
    }
    
    // İstatistikleri hesapla
    const [productsSnapshot, ordersSnapshot, usersSnapshot] = await Promise.all([
      db.collection('products').get(),
      db.collection('orders').get(),
      db.collection('users').get()
    ]);
    
    let totalSales = 0;
    ordersSnapshot.forEach(doc => {
      const orderData = doc.data();
      if (orderData.total) {
        totalSales += orderData.total;
      }
    });
    
    const stats = {
      totalSales: totalSales,
      totalOrders: ordersSnapshot.size,
      totalProducts: productsSnapshot.size,
      totalCustomers: usersSnapshot.size
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Admin istatistik hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/recent-orders', authenticateToken, async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    
    if (!userDoc.exists || userDoc.data().role !== 'admin') {
      return res.status(403).json({ error: 'Admin yetkisi gerekli' });
    }
    
    // Son 10 siparişi getir
    const snapshot = await db.collection('orders')
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();
    
    const orders = [];
    for (const doc of snapshot.docs) {
      const orderData = doc.data();
      
      // Müşteri bilgisini getir
      let customerName = 'Bilinmeyen Müşteri';
      if (orderData.userId) {
        const userDoc = await db.collection('users').doc(orderData.userId).get();
        if (userDoc.exists) {
          customerName = userDoc.data().displayName || userDoc.data().email;
        }
      }
      
      orders.push({
        id: doc.id,
        customerName: customerName,
        total: orderData.total || 0,
        status: orderData.status || 'pending',
        date: orderData.createdAt?.toDate?.() || new Date()
      });
    }
    
    res.json(orders);
  } catch (error) {
    console.error('Son siparişler getirme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// YENİ: Tüm siparişleri getiren admin endpoint'i
app.get('/api/admin/orders', authenticateToken, async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    if (!userDoc.exists || userDoc.data().role !== 'admin') {
      return res.status(403).json({ error: 'Admin yetkisi gerekli' });
    }

    const snapshot = await db.collection('orders').orderBy('createdAt', 'desc').get();
    
    const orders = [];
    for (const doc of snapshot.docs) {
      const orderData = doc.data();
      
      let customerName = 'Bilinmeyen Müşteri';
      if (orderData.userId) {
        const userDoc = await db.collection('users').doc(orderData.userId).get();
        if (userDoc.exists) {
          customerName = userDoc.data().displayName || userDoc.data().email;
        }
      }
      
      const itemCount = orderData.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
      
      orders.push({
        id: doc.id,
        customerName: customerName,
        total: orderData.total || 0,
        status: orderData.status || 'pending',
        date: orderData.createdAt?.toDate?.() || new Date(),
        itemCount: itemCount,
      });
    }
    
    res.json(orders);
  } catch (error) {
    console.error('Tüm siparişleri getirme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/products', authenticateToken, async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    
    if (!userDoc.exists || userDoc.data().role !== 'admin') {
      return res.status(403).json({ error: 'Admin yetkisi gerekli' });
    }
    
    const snapshot = await db.collection('products').get();
    const products = [];
    
    snapshot.forEach(doc => {
      products.push({ id: doc.id, ...doc.data() });
    });
    
    res.json(products);
  } catch (error) {
    console.error('Admin ürün getirme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/products', authenticateToken, async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    if (!userDoc.exists || userDoc.data().role !== 'admin') {
      return res.status(403).json({ error: 'Admin yetkisi gerekli' });
    }
    const productData = req.body;
    // isActive alanı ekle (varsayılan true)
    if (typeof productData.isActive === 'undefined') {
      productData.isActive = true;
    }
    const productRef = await db.collection('products').add({
      ...productData,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    // --- DOSYA SİSTEMİNE KAYDET ---
    try {
      const productsRoot = path.join(__dirname, '../..', 'db', 'products');
      if (!fs.existsSync(productsRoot)) {
        fs.mkdirSync(productsRoot, { recursive: true });
      }
      const productDir = path.join(productsRoot, productRef.id);
      if (!fs.existsSync(productDir)) {
        fs.mkdirSync(productDir, { recursive: true });
      }
      // info.json için model ve bedenli stok desteği
      const infoToSave = {
        ...productData,
        id: productRef.id,
        model: productData.model || '',
        stock: productData.stock || {},
        sizes: productData.sizes || []
      };
      fs.writeFileSync(path.join(productDir, 'info.json'), JSON.stringify(infoToSave, null, 2), 'utf8');
      // Fotoğraf base64 olarak geliyorsa kaydet
      if (productData.image && typeof productData.image === 'string' && productData.image.startsWith('data:image/')) {
        const matches = productData.image.match(/^data:image\/(png|jpeg|jpg);base64,(.+)$/);
        if (matches) {
          const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
          const buffer = Buffer.from(matches[2], 'base64');
          fs.writeFileSync(path.join(productDir, `main.${ext}`), buffer);
        }
      }
    } catch (fsErr) {
      console.error('Dosya kaydetme hatası:', fsErr);
      return res.status(500).json({ error: 'Ürün Firestore\'a kaydedildi fakat dosya sistemine kaydedilemedi', fsError: fsErr.message });
    }
    res.status(201).json({ 
      message: 'Ürün oluşturuldu',
      productId: productRef.id 
    });
  } catch (error) {
    console.error('Ürün oluşturma hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/products/:id', authenticateToken, async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    if (!userDoc.exists || userDoc.data().role !== 'admin') {
      return res.status(403).json({ error: 'Admin yetkisi gerekli' });
    }
    
    const { id } = req.params;
    const productData = req.body;
    // isActive alanı ekle (varsayılan true)
    if (typeof productData.isActive === 'undefined') {
      productData.isActive = true;
    }
    await db.collection('products').doc(id).update({
      ...productData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.json({ message: 'Ürün başarıyla güncellendi', productId: id });
  } catch (error) {
    console.error('Ürün güncelleme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/products/:id', authenticateToken, async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    if (!userDoc.exists || userDoc.data().role !== 'admin') {
      return res.status(403).json({ error: 'Admin yetkisi gerekli' });
    }
    
    const { id } = req.params;
    await db.collection('products').doc(id).delete();
    
    res.json({ message: 'Ürün başarıyla silindi' });
  } catch (error) {
    console.error('Ürün silme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// YENİ: Tüm kullanıcıları getiren admin endpoint'i
app.get('/api/admin/users', authenticateToken, async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    if (!userDoc.exists || userDoc.data().role !== 'admin') {
      return res.status(403).json({ error: 'Admin yetkisi gerekli' });
    }

    const snapshot = await db.collection('users').get();
    const users = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      users.push({
        id: doc.id,
        displayName: data.displayName,
        email: data.email,
        role: data.role,
        createdAt: data.createdAt?.toDate?.() || new Date(),
      });
    });
    
    res.json(users);
  } catch (error) {
    console.error('Kullanıcıları getirme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// YENİ: Kullanıcı rolünü güncelleyen admin endpoint'i
app.put('/api/admin/users/:id/role', authenticateToken, async (req, res) => {
  try {
    const adminUserDoc = await db.collection('users').doc(req.user.uid).get();
    if (!adminUserDoc.exists || adminUserDoc.data().role !== 'admin') {
      return res.status(403).json({ error: 'Admin yetkisi gerekli' });
    }

    const { id } = req.params;
    const { role } = req.body;

    if (!role || (role !== 'admin' && role !== 'user')) {
      return res.status(400).json({ error: 'Geçersiz rol belirtildi.' });
    }

    await db.collection('users').doc(id).update({ role });
    
    res.json({ message: 'Kullanıcı rolü başarıyla güncellendi' });
  } catch (error) {
    console.error('Kullanıcı rolü güncelleme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Sağlık kontrolü
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Dosya yükleme endpoint'i
app.post('/api/upload/upload-image', upload.single('image'), async (req, res) => {
  try {
    console.log('Dosya yükleme isteği alındı');
    
    if (!req.file) {
      console.log('Dosya bulunamadı');
      return res.status(400).json({ error: 'Dosya yüklenmedi' });
    }

    console.log('Dosya bilgileri:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // Firebase Storage'a yükle
    const bucket = admin.storage().bucket();
    const fileName = `images/${Date.now()}-${req.file.originalname}`;
    const file = bucket.file(fileName);
    
    // Dosyayı Storage'a yükle
    await file.save(req.file.buffer, {
      metadata: {
        contentType: req.file.mimetype,
      },
      public: true // Dosyayı public yap
    });

    // Public URL'yi al
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    
    console.log('Dosya Firebase Storage\'a yüklendi:', publicUrl);

    // Firestore'a sadece metadata kaydet
    const imageRef = await db.collection('images').add({
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      storageUrl: publicUrl,
      fileName: fileName,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('Dosya metadata Firestore\'a kaydedildi, ID:', imageRef.id);

    res.json({ 
      success: true, 
      imageUrl: publicUrl,
      fileName: req.file.originalname,
      imageId: imageRef.id
    });

  } catch (error) {
    console.error('Dosya yükleme hatası detayları:', error);
    console.error('Hata stack:', error.stack);
    res.status(500).json({ 
      error: 'Dosya yüklenirken bir hata oluştu',
      details: error.message 
    });
  }
});

// Yerel dosya sistemi ile dosya yükleme endpoint'i (alternatif)
app.post('/api/upload/upload-image-local', upload.single('image'), async (req, res) => {
  try {
    console.log('Yerel dosya yükleme isteği alındı');
    
    if (!req.file) {
      console.log('Dosya bulunamadı');
      return res.status(400).json({ error: 'Dosya yüklenmedi' });
    }

    // Uploads klasörünü oluştur
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Benzersiz dosya adı oluştur
    const fileName = `${Date.now()}-${req.file.originalname}`;
    const filePath = path.join(uploadsDir, fileName);
    
    // Dosyayı kaydet
    fs.writeFileSync(filePath, req.file.buffer);
    
    // Public URL oluştur
    const publicUrl = `http://localhost:5000/uploads/${fileName}`;
    
    console.log('Dosya yerel klasöre kaydedildi:', publicUrl);

    // Firestore'a metadata kaydet
    const imageRef = await db.collection('images').add({
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      localUrl: publicUrl,
      fileName: fileName,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ 
      success: true, 
      imageUrl: publicUrl,
      fileName: req.file.originalname,
      imageId: imageRef.id
    });

  } catch (error) {
    console.error('Yerel dosya yükleme hatası:', error);
    res.status(500).json({ 
      error: 'Dosya yüklenirken bir hata oluştu',
      details: error.message 
    });
  }
});

// Admin: Kategorileri listele
app.get('/api/admin/categories', authenticateToken, async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    if (!userDoc.exists || userDoc.data().role !== 'admin') {
      return res.status(403).json({ error: 'Admin yetkisi gerekli' });
    }
    const snapshot = await db.collection('categories').get();
    const categories = [];
    snapshot.forEach(doc => {
      categories.push({ id: doc.id, ...doc.data() });
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Kategori ekle
app.post('/api/admin/categories', authenticateToken, async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    if (!userDoc.exists || userDoc.data().role !== 'admin') {
      return res.status(403).json({ error: 'Admin yetkisi gerekli' });
    }
    const { name, parentId } = req.body;
    const categoryRef = await db.collection('categories').add({
      name,
      parentId: parentId || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    res.status(201).json({ id: categoryRef.id, message: 'Kategori eklendi' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Kategori güncelle
app.put('/api/admin/categories/:id', authenticateToken, async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    if (!userDoc.exists || userDoc.data().role !== 'admin') {
      return res.status(403).json({ error: 'Admin yetkisi gerekli' });
    }
    const { id } = req.params;
    const { name, parentId } = req.body;
    await db.collection('categories').doc(id).update({
      name,
      parentId: parentId || null
    });
    res.json({ message: 'Kategori güncellendi' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Kategori sil
app.delete('/api/admin/categories/:id', authenticateToken, async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    if (!userDoc.exists || userDoc.data().role !== 'admin') {
      return res.status(403).json({ error: 'Admin yetkisi gerekli' });
    }
    const { id } = req.params;
    await db.collection('categories').doc(id).delete();
    res.json({ message: 'Kategori silindi' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Kullanıcı: Kendi adreslerini listele
app.get('/api/addresses', authenticateToken, async (req, res) => {
  try {
    console.log('Adres listeleme isteği alındı, kullanıcı:', req.user.uid);
    
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    
    if (!userDoc.exists) {
      console.log('Kullanıcı bulunamadı:', req.user.uid);
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    
    const userData = userDoc.data();
    const addresses = userData.addresses || [];
    
    console.log('Kullanıcı adresleri bulundu:', addresses.length);
    
    // Varsayılan adresleri önce göster
    addresses.sort((a, b) => {
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      return 0;
    });
    
    res.json(addresses);
  } catch (error) {
    console.error('Adres listeleme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Kullanıcı: Yeni adres ekle
app.post('/api/addresses', authenticateToken, async (req, res) => {
  try {
    const { title, fullAddress, city, district, postalCode, isDefault } = req.body;
    
    const userRef = db.collection('users').doc(req.user.uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    
    const userData = userDoc.data();
    const addresses = userData.addresses || [];
    
    // Yeni adres objesi
    const newAddress = {
      id: Date.now().toString(), // Basit ID oluştur
      title,
      fullAddress,
      city,
      district,
      postalCode,
      isDefault: isDefault || false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Eğer yeni adres varsayılan olarak işaretlendiyse, diğer adresleri varsayılan olmaktan çıkar
    if (isDefault) {
      addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }
    
    // Yeni adresi ekle
    addresses.push(newAddress);
    
    // Kullanıcı dokümanını güncelle
    await userRef.update({
      addresses: addresses,
      updatedAt: new Date()
    });
    
    res.json(newAddress);
  } catch (error) {
    console.error('Adres ekleme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Kullanıcı: Adres güncelle
app.put('/api/addresses/:id', authenticateToken, async (req, res) => {
  try {
    const { title, fullAddress, city, district, postalCode, isDefault } = req.body;
    const addressId = req.params.id;
    
    const userRef = db.collection('users').doc(req.user.uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    
    const userData = userDoc.data();
    const addresses = userData.addresses || [];
    
    // Adresi bul
    const addressIndex = addresses.findIndex(addr => addr.id === addressId);
    if (addressIndex === -1) {
      return res.status(404).json({ error: 'Adres bulunamadı' });
    }
    
    // Eğer adres varsayılan olarak işaretlendiyse, diğer adresleri varsayılan olmaktan çıkar
    if (isDefault) {
      addresses.forEach(addr => {
        if (addr.id !== addressId) {
          addr.isDefault = false;
        }
      });
    }
    
    // Adresi güncelle
    addresses[addressIndex] = {
      ...addresses[addressIndex],
      title,
      fullAddress,
      city,
      district,
      postalCode,
      isDefault: isDefault || false,
      updatedAt: new Date()
    };
    
    // Kullanıcı dokümanını güncelle
    await userRef.update({
      addresses: addresses,
      updatedAt: new Date()
    });
    
    res.json(addresses[addressIndex]);
  } catch (error) {
    console.error('Adres güncelleme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Kullanıcı: Adres sil
app.delete('/api/addresses/:id', authenticateToken, async (req, res) => {
  try {
    const addressId = req.params.id;
    
    const userRef = db.collection('users').doc(req.user.uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    
    const userData = userDoc.data();
    const addresses = userData.addresses || [];
    
    // Adresi bul ve sil
    const filteredAddresses = addresses.filter(addr => addr.id !== addressId);
    
    if (filteredAddresses.length === addresses.length) {
      return res.status(404).json({ error: 'Adres bulunamadı' });
    }
    
    // Kullanıcı dokümanını güncelle
    await userRef.update({
      addresses: filteredAddresses,
      updatedAt: new Date()
    });
    
    res.json({ message: 'Adres başarıyla silindi' });
  } catch (error) {
    console.error('Adres silme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin: Tüm kullanıcıların adreslerini listele
app.get('/api/admin/addresses', authenticateToken, async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    if (!userDoc.exists || userDoc.data().role !== 'admin') {
      return res.status(403).json({ error: 'Admin yetkisi gerekli' });
    }
    
    const snapshot = await db.collection('users').get();
    const allAddresses = [];
    
    snapshot.forEach(doc => {
      const userData = doc.data();
      const addresses = userData.addresses || [];
      
      addresses.forEach(address => {
        allAddresses.push({
          ...address,
          userId: doc.id,
          userEmail: userData.email,
          userDisplayName: userData.displayName
        });
      });
    });
    
    // Tarihe göre sırala
    allAddresses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json(allAddresses);
  } catch (error) {
    console.error('Admin adres listeleme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin: Kullanıcı adresini güncelle
app.put('/api/admin/addresses/:id', authenticateToken, async (req, res) => {
  try {
    const adminUserDoc = await db.collection('users').doc(req.user.uid).get();
    if (!adminUserDoc.exists || adminUserDoc.data().role !== 'admin') {
      return res.status(403).json({ error: 'Admin yetkisi gerekli' });
    }

    const addressId = req.params.id;
    const { title, fullAddress, city, district, postalCode, isDefault } = req.body;
    
    // Tüm kullanıcıları tara ve adresi bul
    const snapshot = await db.collection('users').get();
    let addressFound = false;
    
    for (const doc of snapshot.docs) {
      const userData = doc.data();
      const addresses = userData.addresses || [];
      const addressIndex = addresses.findIndex(addr => addr.id === addressId);
      
      if (addressIndex !== -1) {
        // Eğer adres varsayılan olarak işaretlendiyse, diğer adresleri varsayılan olmaktan çıkar
        if (isDefault) {
          addresses.forEach(addr => {
            if (addr.id !== addressId) {
              addr.isDefault = false;
            }
          });
        }
        
        // Adresi güncelle
        addresses[addressIndex] = {
          ...addresses[addressIndex],
          title,
          fullAddress,
          city,
          district,
          postalCode,
          isDefault: isDefault || false,
          updatedAt: new Date()
        };
        
        // Kullanıcı dokümanını güncelle
        await db.collection('users').doc(doc.id).update({
          addresses: addresses,
          updatedAt: new Date()
        });
        
        addressFound = true;
        break;
      }
    }
    
    if (!addressFound) {
      return res.status(404).json({ error: 'Adres bulunamadı' });
    }
    
    res.json({ message: 'Adres başarıyla güncellendi' });
  } catch (error) {
    console.error('Admin adres güncelleme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
}); 