import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Alert, 
  CircularProgress,
  Link,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  Email as EmailIcon, 
  Lock as LockIcon,
  ArrowForward as ArrowForwardIcon,
  Google as GoogleIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

export default function LoginPage() {
  const { signInWithEmail, signInWithGoogle } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Her input değişikliğinde hata mesajını temizle
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      setError('E-posta alanı zorunludur');
      return false;
    }
    
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Geçerli bir e-posta adresi giriniz');
      return false;
    }
    
    if (!formData.password.trim()) {
      setError('Şifre alanı zorunludur');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    
    try {
      await signInWithEmail(formData.email, formData.password);
      // Başarılı giriş sonrası yönlendirme AuthContext'te yapılıyor
    } catch (error) {
      let errorMessage = 'Giriş yapılırken bir hata oluştu';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Şifre yanlış';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Geçersiz e-posta adresi';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Çok fazla başarısız deneme. Lütfen daha sonra tekrar deneyin';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    
    try {
      await signInWithGoogle();
    } catch (error) {
      setError('Google ile giriş yapılırken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Şifre sıfırlama fonksiyonu
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    setResetMessage('');
    const auth = getAuth();
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMessage('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi!');
    } catch (error) {
      let msg = 'Bir hata oluştu';
      if (error.code === 'auth/user-not-found') {
        msg = 'Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı';
      } else if (error.code === 'auth/invalid-email') {
        msg = 'Geçersiz e-posta adresi';
      }
      setResetMessage(msg);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Giriş Yap - Ayakkabı Mağazası</title>
        <meta name="description" content="Hesabınıza giriş yapın" />
      </Head>
      
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          py: 4
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={24}
            sx={{
              p: 4,
              borderRadius: 3,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            {/* Header */}
            <Box textAlign="center" mb={4}>
              <Typography variant="h4" component="h1" fontWeight={700} color="primary" gutterBottom>
                Giriş Yap
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Hesabınıza güvenli bir şekilde giriş yapın
              </Typography>
            </Box>

            {/* Error Message */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Google Sign In Button */}
            <Button
              fullWidth
              variant="outlined"
              size="large"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleSignIn}
              disabled={loading}
              sx={{
                mb: 3,
                py: 1.5,
                borderRadius: 2,
                borderColor: '#ddd',
                color: '#333',
                '&:hover': {
                  borderColor: '#999',
                  backgroundColor: '#f5f5f5'
                }
              }}
            >
              Google ile Giriş Yap
            </Button>

            <Divider sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                veya
              </Typography>
            </Divider>

            {/* Login Form */}
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="E-posta"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                margin="normal"
                required
                InputProps={{
                  startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="Şifre"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                margin="normal"
                required
                InputProps={{
                  startAdornment: <LockIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                sx={{ mb: 1 }}
              />

              <Box textAlign="right" mb={2}>
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => setResetModalOpen(true)}
                  sx={{ color: 'primary.main', textDecoration: 'underline', cursor: 'pointer' }}
                >
                  Şifremi Unuttum?
                </Link>
              </Box>
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                endIcon={loading ? <CircularProgress size={20} /> : <ArrowForwardIcon />}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)'
                  }
                }}
              >
                {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
              </Button>
            </Box>

            {/* Register Link */}
            <Box textAlign="center" mt={3}>
              <Typography variant="body2" color="text.secondary">
                Hesabınız yok mu?{' '}
                <Link
                  href="/register"
                  sx={{
                    color: 'primary.main',
                    textDecoration: 'none',
                    fontWeight: 600,
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  Kayıt Ol
                </Link>
              </Typography>
            </Box>
          </Paper>
        </Container>
      </Box>

      {/* Şifre Sıfırlama Modalı */}
      <Dialog open={resetModalOpen} onClose={() => setResetModalOpen(false)}>
        <DialogTitle>Şifre Sıfırlama</DialogTitle>
        <DialogContent>
          <Typography variant="body2" mb={2}>
            Şifre sıfırlama bağlantısı göndermek için e-posta adresinizi girin.
          </Typography>
          <TextField
            fullWidth
            label="E-posta"
            type="email"
            value={resetEmail}
            onChange={e => setResetEmail(e.target.value)}
            margin="normal"
            required
            InputProps={{
              startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />
          {resetMessage && (
            <Alert severity={resetMessage.includes('gönderildi') ? 'success' : 'error'} sx={{ mt: 2 }}>
              {resetMessage}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetModalOpen(false)}>İptal</Button>
          <Button
            variant="contained"
            onClick={handlePasswordReset}
            disabled={resetLoading || !resetEmail}
          >
            {resetLoading ? 'Gönderiliyor...' : 'Gönder'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
} 