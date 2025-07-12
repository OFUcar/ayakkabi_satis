import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { ErrorOutline as ErrorIcon } from '@mui/icons-material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // State'i güncelleyerek fallback UI'yi göster
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Hata loglama
    console.error('Error Boundary yakaladı:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh',
            textAlign: 'center',
            p: 3
          }}
        >
          <ErrorIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Bir şeyler yanlış gitti
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Sayfa yüklenirken bir hata oluştu. Lütfen sayfayı yenilemeyi deneyin.
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => window.location.reload()}
            sx={{ mr: 2 }}
          >
            Sayfayı Yenile
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => window.location.href = '/'}
          >
            Ana Sayfaya Dön
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 