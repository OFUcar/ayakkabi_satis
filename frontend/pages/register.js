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
  Divider
} from '@mui/material';
import { 
  Email as EmailIcon, 
  Lock as LockIcon, 
  Person as PersonIcon,
  ArrowForward as ArrowForwardIcon,
  Google as GoogleIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function RegisterPage() {
  const { registerWithEmail, signInWithGoogle } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Her input değişikliğinde hata mesajını temizle
  };

  const validateForm = () => {
    if (!formData.displayName.trim()) {
      setError('Ad Soyad alanı zorunludur');
      return false;
    }
    
    if (!formData.email.trim()) {
      setError('E-posta alanı zorunludur');
      return false;
    }
    
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Geçerli bir e-posta adresi giriniz');
      return false;
    }
    
    if (formData.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await registerWithEmail(formData.email, formData.password, formData.displayName);
      setSuccess('Hesabınız başarıyla oluşturuldu! Yönlendiriliyorsunuz...');
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (error) {
      let errorMessage = 'Kayıt olurken bir hata oluştu';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Bu e-posta adresi zaten kullanımda';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Şifre çok zayıf';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Geçersiz e-posta adresi';
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

  return (
    <>
      <Head>
        <title>Kayıt Ol - Ayakkabı Mağazası</title>
        <meta name="description" content="Hesap oluşturun ve alışverişe başlayın" />
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
                Hesap Oluştur
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Hızlı ve güvenli bir şekilde hesabınızı oluşturun
              </Typography>
            </Box>

            {/* Error/Success Messages */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {success}
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
              Google ile Kayıt Ol
            </Button>

            <Divider sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                veya
              </Typography>
            </Divider>

            {/* Registration Form */}
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Ad Soyad"
                name="displayName"
                value={formData.displayName}
                onChange={handleInputChange}
                margin="normal"
                required
                InputProps={{
                  startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                sx={{ mb: 2 }}
              />
              
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
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="Şifre Tekrar"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                margin="normal"
                required
                InputProps={{
                  startAdornment: <LockIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                sx={{ mb: 3 }}
              />
              
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
                {loading ? 'Kayıt Olunuyor...' : 'Kayıt Ol'}
              </Button>
            </Box>

            {/* Login Link */}
            <Box textAlign="center" mt={3}>
              <Typography variant="body2" color="text.secondary">
                Zaten hesabınız var mı?{' '}
                <Link
                  href="/login"
                  sx={{
                    color: 'primary.main',
                    textDecoration: 'none',
                    fontWeight: 600,
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  Giriş Yap
                </Link>
              </Typography>
            </Box>
          </Paper>
        </Container>
      </Box>
    </>
  );
} 