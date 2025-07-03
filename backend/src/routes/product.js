const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// Ürün ekle
router.post('/add', async (req, res) => {
  try {
    const { name, description, price, stock, image, categoryId } = req.body;
    const productRef = db.collection('products').doc();
    await productRef.set({
      name,
      description,
      price,
      stock,
      image,
      categoryId,
      createdAt: new Date()
    });
    res.status(201).json({ id: productRef.id, message: 'Ürün eklendi' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 