import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';

// Mevcut ürünlerdeki resim URL'lerini düzelt
export const fixProductImages = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'products'));
    const batch = writeBatch(db);
    
    querySnapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (data.images && data.images.length > 0) {
        // localhost:5000 URL'lerini placeholder URL'lerle değiştir
        const fixedImages = data.images.map(img => {
          if (img.includes('localhost:5000')) {
            // Ürün adına göre farklı placeholder resimler
            const productName = data.name.toLowerCase();
            if (productName.includes('nike')) {
              return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop';
            } else if (productName.includes('adidas')) {
              return 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&h=400&fit=crop';
            } else if (productName.includes('vans')) {
              return 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400&h=400&fit=crop';
            } else if (productName.includes('converse')) {
              return 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=400&h=400&fit=crop';
            } else if (productName.includes('puma')) {
              return 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop';
            } else {
              return 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop';
            }
          }
          return img;
        });
        
        batch.update(doc.ref, { images: fixedImages });
      }
    });
    
    await batch.commit();
    console.log('Ürün resimleri düzeltildi!');
  } catch (error) {
    console.error('Resim düzeltme hatası:', error);
  }
};

// Test verileri ekleme fonksiyonları
export const initializeTestData = async () => {
  try {
    // Kategoriler ekle
    const categories = [
      { name: 'Spor Ayakkabı' },
      { name: 'Günlük Ayakkabı' },
      { name: 'Koşu Ayakkabısı' },
      { name: 'Skate Ayakkabısı' }
    ];

    for (const category of categories) {
      await addDoc(collection(db, 'categories'), {
        ...category,
        createdAt: serverTimestamp()
      });
    }

    // Ürünler ekle
    const products = [
      {
        name: 'Nike Air Max 270',
        description: 'Rahat ve şık spor ayakkabı',
        price: 1299.99,
        category: 'Spor Ayakkabı',
        brand: 'Nike',
        type: 'Spor Ayakkabı',
        stock: { '40': 5, '41': 8, '42': 10, '43': 6 },
        images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop'],
        isActive: true,
        discount: 0
      },
      {
        name: 'Adidas Ultraboost 22',
        description: 'Profesyonel koşu ayakkabısı',
        price: 1899.99,
        category: 'Koşu Ayakkabısı',
        brand: 'Adidas',
        type: 'Koşu Ayakkabısı',
        stock: { '39': 3, '40': 7, '41': 9, '42': 5 },
        images: ['https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&h=400&fit=crop'],
        isActive: true,
        discount: 10
      },
      {
        name: 'Vans Old Skool',
        description: 'Klasik skate ayakkabısı',
        price: 899.99,
        category: 'Skate Ayakkabısı',
        brand: 'Vans',
        type: 'Skate Ayakkabısı',
        stock: { '38': 4, '39': 6, '40': 8, '41': 7 },
        images: ['https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400&h=400&fit=crop'],
        isActive: true,
        discount: 0
      },
      {
        name: 'Converse Chuck Taylor',
        description: 'Klasik canvas ayakkabı',
        price: 699.99,
        category: 'Günlük Ayakkabı',
        brand: 'Converse',
        type: 'Günlük Ayakkabı',
        stock: { '36': 3, '37': 5, '38': 7, '39': 6 },
        images: ['https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=400&h=400&fit=crop'],
        isActive: true,
        discount: 0
      },
      {
        name: 'Puma RS-X',
        description: 'Retro spor ayakkabı',
        price: 1099.99,
        category: 'Spor Ayakkabı',
        brand: 'Puma',
        type: 'Spor Ayakkabı',
        stock: { '40': 4, '41': 6, '42': 8, '43': 5 },
        images: ['https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop'],
        isActive: true,
        discount: 15
      }
    ];

    for (const product of products) {
      await addDoc(collection(db, 'products'), {
        ...product,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }

    console.log('Test verileri başarıyla eklendi!');
  } catch (error) {
    console.error('Test verileri eklenirken hata:', error);
  }
};

// Ürün servisleri
export const productService = {
  // Tüm ürünleri getir
  async getAllProducts() {
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Ürünler getirilemedi:', error);
      return [];
    }
  },

  // Ürün detayını getir
  async getProductById(id) {
    try {
      const docRef = doc(db, 'products', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Ürün detayı getirilemedi:', error);
      return null;
    }
  },

  // Ürün ekle (Admin)
  async addProduct(productData) {
    try {
      const docRef = await addDoc(collection(db, 'products'), {
        ...productData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { id: docRef.id, ...productData };
    } catch (error) {
      console.error('Ürün eklenemedi:', error);
      throw error;
    }
  },

  // Ürün güncelle (Admin)
  async updateProduct(id, productData) {
    try {
      const docRef = doc(db, 'products', id);
      await updateDoc(docRef, {
        ...productData,
        updatedAt: serverTimestamp()
      });
      return { id, ...productData };
    } catch (error) {
      console.error('Ürün güncellenemedi:', error);
      throw error;
    }
  },

  // Ürün sil (Admin)
  async deleteProduct(id) {
    try {
      await deleteDoc(doc(db, 'products', id));
      return true;
    } catch (error) {
      console.error('Ürün silinemedi:', error);
      throw error;
    }
  }
};

// Kategori servisleri
export const categoryService = {
  async getAllCategories() {
    try {
      const querySnapshot = await getDocs(collection(db, 'categories'));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Kategoriler getirilemedi:', error);
      return [];
    }
  },

  async addCategory(categoryData) {
    try {
      const docRef = await addDoc(collection(db, 'categories'), {
        ...categoryData,
        createdAt: serverTimestamp()
      });
      return { id: docRef.id, ...categoryData };
    } catch (error) {
      console.error('Kategori eklenemedi:', error);
      throw error;
    }
  },

  async deleteCategory(id) {
    try {
      await deleteDoc(doc(db, 'categories', id));
      return true;
    } catch (error) {
      console.error('Kategori silinemedi:', error);
      throw error;
    }
  }
};

// Kullanıcı servisleri
export const userService = {
  async getUserById(uid) {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Kullanıcı getirilemedi:', error);
      return null;
    }
  },

  async createUser(uid, userData) {
    try {
      await updateDoc(doc(db, 'users', uid), {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { id: uid, ...userData };
    } catch (error) {
      console.error('Kullanıcı oluşturulamadı:', error);
      throw error;
    }
  },

  async updateUser(uid, userData) {
    try {
      await updateDoc(doc(db, 'users', uid), {
        ...userData,
        updatedAt: serverTimestamp()
      });
      return { id: uid, ...userData };
    } catch (error) {
      console.error('Kullanıcı güncellenemedi:', error);
      throw error;
    }
  },

  async getAllUsers() {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Kullanıcılar getirilemedi:', error);
      return [];
    }
  }
};

// Sipariş servisleri
export const orderService = {
  async createOrder(orderData) {
    try {
      const docRef = await addDoc(collection(db, 'orders'), {
        ...orderData,
        createdAt: serverTimestamp(),
        status: 'pending'
      });
      return { id: docRef.id, ...orderData };
    } catch (error) {
      console.error('Sipariş oluşturulamadı:', error);
      throw error;
    }
  },

  async getUserOrders(userId) {
    try {
      const q = query(
        collection(db, 'orders'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Kullanıcı siparişleri getirilemedi:', error);
      return [];
    }
  },

  async getAllOrders() {
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Tüm siparişler getirilemedi:', error);
      return [];
    }
  },

  async updateOrderStatus(orderId, status) {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Sipariş durumu güncellenemedi:', error);
      throw error;
    }
  }
};

// Adres servisleri
export const addressService = {
  async getUserAddresses(userId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return userDoc.data().addresses || [];
      }
      return [];
    } catch (error) {
      console.error('Kullanıcı adresleri getirilemedi:', error);
      return [];
    }
  },

  async addAddress(userId, addressData) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('Kullanıcı bulunamadı');
      }

      const addresses = userDoc.data().addresses || [];
      const newAddress = {
        id: Date.now().toString(),
        ...addressData,
        createdAt: new Date()
      };

      await updateDoc(userRef, {
        addresses: [...addresses, newAddress],
        updatedAt: serverTimestamp()
      });

      return newAddress;
    } catch (error) {
      console.error('Adres eklenemedi:', error);
      throw error;
    }
  },

  async updateAddress(userId, addressId, addressData) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('Kullanıcı bulunamadı');
      }

      const addresses = userDoc.data().addresses || [];
      const addressIndex = addresses.findIndex(addr => addr.id === addressId);
      
      if (addressIndex === -1) {
        throw new Error('Adres bulunamadı');
      }

      addresses[addressIndex] = {
        ...addresses[addressIndex],
        ...addressData,
        updatedAt: new Date()
      };

      await updateDoc(userRef, {
        addresses,
        updatedAt: serverTimestamp()
      });

      return addresses[addressIndex];
    } catch (error) {
      console.error('Adres güncellenemedi:', error);
      throw error;
    }
  },

  async deleteAddress(userId, addressId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('Kullanıcı bulunamadı');
      }

      const addresses = userDoc.data().addresses || [];
      const filteredAddresses = addresses.filter(addr => addr.id !== addressId);

      await updateDoc(userRef, {
        addresses: filteredAddresses,
        updatedAt: serverTimestamp()
      });

      return true;
    } catch (error) {
      console.error('Adres silinemedi:', error);
      throw error;
    }
  }
};

// Firebase Storage ile resim yükleme
export const uploadImage = async (file) => {
  try {
    const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Resim yükleme hatası:', error);
    throw error;
  }
}; 