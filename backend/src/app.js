const express = require('express');
const cors = require('cors');
const multer = require('multer');
const userRoutes = require('./routes/user');
const productRoutes = require('./routes/product');
const categoryRoutes = require('./routes/category');
const uploadRoutes = require('./routes/upload');

const app = express();
app.use(cors());
app.use(express.json());

// Debug middleware - tüm istekleri logla
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Basit bir test endpointi
app.get('/', (req, res) => {
  res.send('Ayakkabı API çalışıyor!');
});

// Upload endpoint test
app.get('/api/test-upload', (req, res) => {
  res.json({ message: 'Upload endpoint çalışıyor!' });
});

app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/upload', uploadRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor.`);
  console.log('Mevcut endpoint\'ler:');
  console.log('- GET /');
  console.log('- GET /api/test-upload');
  console.log('- POST /api/upload/upload-image');
  console.log('- POST /api/upload/upload-images');
});
