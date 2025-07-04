import React, { useState } from 'react';
import { initializeTestData, fixProductImages } from '../services/firestoreService';
import { Box, Button, Typography, Alert, Stack } from '@mui/material';

export default function InitData() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleInitData = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      await initializeTestData();
      setMessage('Test verileri başarıyla eklendi!');
    } catch (error) {
      setMessage('Hata: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFixImages = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      await fixProductImages();
      setMessage('Ürün resimleri başarıyla düzeltildi!');
    } catch (error) {
      setMessage('Hata: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Firebase Veri Yönetimi
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3 }}>
        Bu sayfa sadece geliştirme amaçlıdır. Firebase Firestore'da veri işlemleri yapar.
      </Typography>

      {message && (
        <Alert severity={message.includes('başarıyla') ? 'success' : 'error'} sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      <Stack spacing={2}>
        <Button
          variant="contained"
          onClick={handleInitData}
          disabled={loading}
          size="large"
        >
          {loading ? 'Ekleniyor...' : 'Test Verilerini Ekle'}
        </Button>

        <Button
          variant="outlined"
          onClick={handleFixImages}
          disabled={loading}
          size="large"
        >
          {loading ? 'Düzeltiliyor...' : 'Ürün Resimlerini Düzelt'}
        </Button>
      </Stack>
    </Box>
  );
} 