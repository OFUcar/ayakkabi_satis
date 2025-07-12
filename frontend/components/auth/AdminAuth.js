import React from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { Box, Typography, CircularProgress } from '@mui/material';

const AdminAuth = ({ children }) => {
  const { userData, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Yetki kontrol ediliyor...</Typography>
      </Box>
    );
  }

  if (userData?.role !== 'admin') {
    // Router işlemini güvenli hale getir
    React.useEffect(() => {
      if (typeof window !== 'undefined') {
        const timer = setTimeout(() => {
          router.replace('/').catch(err => {
            console.warn('Router navigation error:', err);
            window.location.href = '/';
          });
        }, 100);
        return () => clearTimeout(timer);
      }
    }, [router]);

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
            <Typography variant="h5" color="error">Erişim Reddedildi</Typography>
            <Typography>Bu sayfayı görüntüleme yetkiniz yok. Ana sayfaya yönlendiriliyorsunuz...</Typography>
        </Box>
    );
  }

  return children;
};

export default AdminAuth; 