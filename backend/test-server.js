const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Uploads klasörüne statik erişim
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Multer konfigürasyonu
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Sadece resim dosyaları yüklenebilir!'), false);
    }
  },
});

// Sağlık kontrolü
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Yerel dosya sistemi ile dosya yükleme endpoint'i
app.post('/api/upload/upload-image-local', upload.single('image'), async (req, res) => {
  try {
    console.log('Yerel dosya yükleme isteği alındı');
    
    if (!req.file) {
      console.log('Dosya bulunamadı');
      return res.status(400).json({ error: 'Dosya yüklenmedi' });
    }

    console.log('Dosya bilgileri:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

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

    res.json({ 
      success: true, 
      imageUrl: publicUrl,
      fileName: req.file.originalname
    });

  } catch (error) {
    console.error('Yerel dosya yükleme hatası:', error);
    res.status(500).json({ 
      error: 'Dosya yüklenirken bir hata oluştu',
      details: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Test Server ${PORT} portunda çalışıyor`);
}); 