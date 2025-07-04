const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

admin.initializeApp({
  credential: admin.credential.cert(require('./firebaseServiceAccount.json')),
  storageBucket: "ayakkabi-satis-07.firebasestorage.app"
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

async function migrateImages() {
  const productsSnapshot = await db.collection('products').get();
  for (const doc of productsSnapshot.docs) {
    const data = doc.data();
    let updated = false;
    if (data.images && Array.isArray(data.images)) {
      const newImages = [];
      for (const imgUrl of data.images) {
        if (imgUrl.startsWith('http://localhost:5000/uploads/')) {
          // Görseli localden oku
          const fileName = imgUrl.split('/').pop();
          const filePath = path.join(__dirname, 'uploads', fileName);
          let buffer;
          if (fs.existsSync(filePath)) {
            buffer = fs.readFileSync(filePath);
          } else {
            // Eğer localde yoksa, HTTP ile çekmeyi dene
            const res = await fetch(imgUrl);
            buffer = await res.buffer();
          }
          // Firebase Storage'a yükle
          const storageFileName = `products/${Date.now()}_${fileName}`;
          const storageFile = bucket.file(storageFileName);
          await storageFile.save(buffer, { public: true });
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${storageFileName}`;
          newImages.push(publicUrl);
          updated = true;
        } else {
          newImages.push(imgUrl);
        }
      }
      if (updated) {
        await doc.ref.update({ images: newImages });
        console.log(`Ürün ${doc.id} güncellendi.`);
      }
    }
  }
  console.log('Tüm görseller güncellendi!');
}

migrateImages(); 