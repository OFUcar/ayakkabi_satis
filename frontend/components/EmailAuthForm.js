import React, { useState } from "react";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from "firebase/auth";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import styles from '../styles/AuthModal.module.css';
import { useRouter } from 'next/router';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';

export default function EmailAuthForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    
    try {
      let result;
      if (isLogin) {
        result = await signInWithEmailAndPassword(auth, email, password);
        setMessage({ type: 'success', text: 'Başarıyla giriş yapıldı!' });
      } else {
        result = await createUserWithEmailAndPassword(auth, email, password);
        // Yeni kullanıcıyı backend'e kaydet
        await fetch("http://localhost:5000/api/users/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: email.split("@")[0],
            email,
            provider: "local",
            providerId: result.user.uid,
            role: "user"
          })
        });
        setMessage({ type: 'success', text: 'Hesap başarıyla oluşturuldu!' });
      }
      setUser(result.user);
    } catch (error) {
      let errorMessage = 'Bir hata oluştu';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Şifre yanlış';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Bu e-posta adresi zaten kullanımda';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Şifre en az 6 karakter olmalıdır';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Geçersiz e-posta adresi';
      }
      setMessage({ type: 'error', text: errorMessage });
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

  // Şifre sıfırlama fonksiyonu
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    setResetMessage("");
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

  if (user) {
    return (
      <Box sx={{ textAlign: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <CheckCircleIcon sx={{ color: '#28a745', mr: 1, fontSize: 24 }} />
          <Typography variant="h6" sx={{ color: '#28a745' }}>
            Hoşgeldin, {user.email}
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
    <Box className={styles.emailForm}>
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
      
      <form onSubmit={handleSubmit}>
        <Box className={styles.formField}>
          <TextField
            type="email"
            placeholder="E-posta adresiniz"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            className={styles.inputField}
            InputProps={{
              startAdornment: <EmailIcon sx={{ mr: 1, color: '#6c757d' }} />,
            }}
          />
        </Box>
        
        <Box className={styles.formField}>
          <TextField
            type="password"
            placeholder="Şifreniz"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            className={styles.inputField}
            InputProps={{
              startAdornment: <LockIcon sx={{ mr: 1, color: '#6c757d' }} />,
            }}
          />
        </Box>

        {/* Şifremi Unuttum Linki */}
        {isLogin && (
          <Box sx={{ textAlign: 'right', mb: 2 }}>
            <Button
              variant="text"
              size="small"
              sx={{ color: 'primary.main', textTransform: 'none', textDecoration: 'underline' }}
              onClick={() => { setResetEmail(email); setResetModalOpen(true); }}
            >
              Şifremi Unuttum?
            </Button>
          </Box>
        )}
        
        <Button 
          type="submit"
          disabled={loading}
          className={`${styles.submitButton} ${loading ? styles.loadingButton : ''}`}
          endIcon={
            loading ? (
              <CircularProgress size={20} className={styles.loadingSpinner} />
            ) : (
              <ArrowForwardIcon />
            )
          }
        >
          {loading ? (isLogin ? 'Giriş yapılıyor...' : 'Kayıt olunuyor...') : (isLogin ? 'Giriş Yap' : 'Kayıt Ol')}
        </Button>
      </form>
      
      <Box 
        className={styles.toggleButton}
        onClick={() => {
          if (isLogin) {
            // Kayıt sayfasına yönlendir
            router.push('/register');
          } else {
            // Giriş sayfasına yönlendir
            router.push('/login');
          }
        }}
      >
        <Typography variant="body2">
          {isLogin ? 'Hesabın yok mu? Kayıt ol' : 'Zaten hesabın var mı? Giriş yap'}
        </Typography>
        <ArrowForwardIcon className={styles.toggleIcon} />
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
    </Box>
  );
} 