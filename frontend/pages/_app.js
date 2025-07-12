import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from '../contexts/AuthContext';
import { CartProvider } from '../contexts/CartContext';
import AdminAuth from '../components/auth/AdminAuth';
import ErrorBoundary from '../components/ErrorBoundary';
import { useRouter } from 'next/router';
import '../styles/globals.css';

// Lüks tema yapılandırması
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#f5b041',
    },
    secondary: {
      main: '#e89611',
    },
    background: {
      default: '#1a1a1a',
      paper: '#3d3d3d',
    },
    text: {
      primary: '#ffffff',
      secondary: '#f5b041',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 700,
    },
    h2: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 600,
    },
    h3: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 25,
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          background: 'linear-gradient(145deg, #3d3d3d 0%, #454545 100%)',
          border: '1px solid #5d5d5d',
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
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}

export default MyApp; 