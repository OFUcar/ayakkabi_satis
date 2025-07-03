import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from '../contexts/AuthContext';
import { CartProvider } from '../contexts/CartContext';
import AdminAuth from '../components/auth/AdminAuth';
import { useRouter } from 'next/router';

// Basit tema yapılandırması
const theme = createTheme({
  palette: {
    primary: {
      main: '#6c757d',
    },
    secondary: {
      main: '#495057',
    },
    background: {
      default: '#f8f9fa',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hydration sırasında boş div döndür
  if (!mounted) {
    return <div style={{ visibility: 'hidden' }} />;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <CartProvider>
          {router.pathname.startsWith('/admin') ? (
            <AdminAuth>
              <Component {...pageProps} />
            </AdminAuth>
          ) : (
            <Component {...pageProps} />
          )}
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default MyApp; 