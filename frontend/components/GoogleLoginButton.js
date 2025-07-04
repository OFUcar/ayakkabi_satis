import React, { useState } from "react";
import { auth, GoogleAuthProvider, signInWithPopup, signOut } from "../firebase";
import { userService } from '../services/firestoreService';
import { API_ENDPOINTS } from '../config/api';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import styles from '../styles/AuthModal.module.css';

export default function GoogleLoginButton() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleLogin = async () => {
    setLoading(true);
    setMessage(null);
    
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      
      // Kullanıcıyı Firestore'a kaydet
      await userService.createUser(result.user.uid, {
        email: result.user.email,
        displayName: result.user.displayName,
        role: "user"
      });
      
      setMessage({ type: 'success', text: 'Başarıyla giriş yapıldı!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Giriş başarısız: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      setMessage({ type: 'success', text: 'Başarıyla çıkış yapıldı!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Çıkış başarısız: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <Box sx={{ textAlign: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <CheckCircleIcon sx={{ color: '#28a745', mr: 1, fontSize: 24 }} />
          <Typography variant="h6" sx={{ color: '#28a745' }}>
            Hoşgeldin, {user.displayName}
          </Typography>
        </Box>
        
        {message && (
          <Box className={`${styles.message} ${styles.successMessage}`}>
            <Typography variant="body2">{message.text}</Typography>
          </Box>
        )}
        
        <Button 
          onClick={handleLogout}
          disabled={loading}
          className={`${styles.submitButton} ${loading ? styles.loadingButton : ''}`}
        >
          {loading && <CircularProgress size={20} className={styles.loadingSpinner} />}
          Çıkış Yap
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {message && (
        <Box className={`${styles.message} ${message.type === 'success' ? styles.successMessage : styles.errorMessage}`}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {message.type === 'success' ? (
              <CheckCircleIcon sx={{ mr: 1, fontSize: 20 }} />
            ) : (
              <ErrorIcon sx={{ mr: 1, fontSize: 20 }} />
            )}
            <Typography variant="body2">{message.text}</Typography>
          </Box>
        </Box>
      )}
      
      <Button 
        onClick={handleLogin}
        disabled={loading}
        className={`${styles.googleButton} ${loading ? styles.loadingButton : ''}`}
        startIcon={
          loading ? (
            <CircularProgress size={20} className={styles.loadingSpinner} />
          ) : (
            <Box className={styles.googleIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </Box>
          )
        }
      >
        {loading ? 'Giriş yapılıyor...' : 'Google ile Giriş Yap'}
      </Button>
    </Box>
  );
} 