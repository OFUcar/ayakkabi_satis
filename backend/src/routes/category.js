const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// Kategori ekle
router.post('/add', async (req, res) => {
  try {
    const { name, parentId } = req.body;
    const categoryRef = db.collection('categories').doc();
    await categoryRef.set({
      name,
      parentId: parentId || null,
      createdAt: new Date()
    });
    res.status(201).json({ id: categoryRef.id, message: 'Kategori eklendi' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 