const express = require('express');
const multer = require('multer');
const { admin } = require('../config/firebase');
const router = express.Router();

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

// Tek dosya yükleme endpoint'i
router.post('/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Dosya yüklenmedi' });
    }

    const bucket = admin.storage().bucket();
    const fileName = `products/${Date.now()}_${req.file.originalname}`;
    const file = bucket.file(fileName);

    // Dosyayı Firebase Storage'a yükle
    await file.save(req.file.buffer, {
      metadata: {
        contentType: req.file.mimetype,
      },
    });

    // Dosyayı public yap
    await file.makePublic();

    // Public URL'yi al
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

    res.json({ 
      success: true, 
      imageUrl: publicUrl,
      fileName: fileName 
    });

  } catch (error) {
    console.error('Dosya yükleme hatası:', error);
    res.status(500).json({ 
      error: 'Dosya yüklenirken bir hata oluştu',
      details: error.message 
    });
  }
});

// Çoklu dosya yükleme endpoint'i
router.post('/upload-images', upload.array('images', 15), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Dosya yüklenmedi' });
    }

    const bucket = admin.storage().bucket();
    const uploadPromises = req.files.map(async (file) => {
      const fileName = `products/${Date.now()}_${file.originalname}`;
      const bucketFile = bucket.file(fileName);

      // Dosyayı Firebase Storage'a yükle
      await bucketFile.save(file.buffer, {
        metadata: {
          contentType: file.mimetype,
        },
      });

      // Dosyayı public yap
      await bucketFile.makePublic();

      // Public URL'yi al
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

      return {
        originalName: file.originalname,
        fileName: fileName,
        imageUrl: publicUrl
      };
    });

    const results = await Promise.all(uploadPromises);

    res.json({ 
      success: true, 
      images: results 
    });

  } catch (error) {
    console.error('Dosya yükleme hatası:', error);
    res.status(500).json({ 
      error: 'Dosyalar yüklenirken bir hata oluştu',
      details: error.message 
    });
  }
});

module.exports = router; 