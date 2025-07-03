const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// Kullanıcı ekle
router.post('/add', async (req, res) => {
  try {
    const { name, email, provider, providerId, role } = req.body;
    const userRef = db.collection('users').doc();
    await userRef.set({
      name,
      email,
      provider,
      providerId,
      role: role || 'user',
      createdAt: new Date()
    });
    res.status(201).json({ id: userRef.id, message: 'Kullanıcı eklendi' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 