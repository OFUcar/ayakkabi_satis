import React, { useState, useEffect } from "react";
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import GoogleLoginButton from "./GoogleLoginButton";
import EmailAuthForm from "./EmailAuthForm";
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import styles from '../styles/AuthModal.module.css';

export default function AuthModal({ open, onClose }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Kullanıcı giriş yaptığında ve modal açık olduğunda modalı kapat.
    if (user && open) {
      onClose();
    }
  }, [user, open, onClose]);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      onClose();
    } catch (error) {
      console.error('Çıkış hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserDisplayName = () => {
    if (user) {
      return user.displayName || user.email?.split('@')[0] || 'Kullanıcı';
    }
    return null;
  };

  const getUserEmail = () => {
    return user?.email || '';
  };

  const getUserAvatar = () => {
    if (user?.photoURL) {
      return user.photoURL;
    }
    return null;
  };

  // Eğer kullanıcı yoksa ve modal kapalıysa hiçbir şey render etme (performans için)
  if (!open && !user) {
    return null;
  }

  // Kullanıcı varsa ve modal kapalıysa, bu modalı render etmeye gerek yok.
  // Bu, "Hesap Bilgileri" görünümünün gereksiz yere render edilmesini önler.
  if (user && !open) {
      return null;
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      classes={{
        paper: styles.modalPaper,
        root: styles.modal
      }}
    >
      <DialogTitle className={styles.modalHeader}>
        <Typography variant="h5" className={styles.modalTitle}>
          {user ? 'Hesap Bilgileri' : 'Hoş Geldiniz'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {user ? 'Hesap ayarlarınızı yönetin' : 'Hesabınıza giriş yapın veya yeni hesap oluşturun'}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          className={styles.closeButton}
        >
          <CloseIcon className={styles.closeIcon} />
        </IconButton>
      </DialogTitle>
      
      <DialogContent className={styles.modalContent}>
        {user ? (
          // Giriş yapılmış kullanıcı için çıkış ekranı
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
              <CheckCircleIcon sx={{ color: '#28a745', mr: 1, fontSize: 24 }} />
              <Typography variant="h6" sx={{ color: '#28a745' }}>
                Başarıyla Giriş Yapıldı
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
              <Avatar 
                src={getUserAvatar()}
                sx={{ 
                  width: 80, 
                  height: 80, 
                  mr: 2,
                  bgcolor: '#f8f9fa',
                  color: '#495057'
                }}
              >
                {getUserDisplayName()?.charAt(0)?.toUpperCase()}
              </Avatar>
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#212529' }}>
                  {getUserDisplayName()}
                </Typography>
                <Typography variant="body2" sx={{ color: '#6c757d' }}>
                  {getUserEmail()}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ 
              p: 3, 
              borderRadius: 2, 
              bgcolor: '#f8f9fa', 
              mb: 3,
              border: '1px solid #e9ecef'
            }}>
              <Typography variant="body2" sx={{ color: '#6c757d', mb: 1 }}>
                Hesap Durumu
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500, color: '#28a745' }}>
                Aktif
              </Typography>
            </Box>
            
            <Button 
              onClick={handleLogout}
              disabled={loading}
              variant="outlined"
              startIcon={<LogoutIcon />}
              className={styles.submitButton}
              sx={{ 
                borderColor: '#dc3545',
                color: '#dc3545',
                '&:hover': {
                  bgcolor: '#dc3545',
                  color: '#ffffff'
                }
              }}
            >
              {loading ? 'Çıkış yapılıyor...' : 'Çıkış Yap'}
            </Button>
          </Box>
        ) : (
          // Giriş yapılmamış kullanıcı için giriş formları
          <>
            {/* Google ile Giriş Bölümü */}
            <Box className={styles.sectionHeader}>
              <Typography variant="h6" className={styles.sectionTitle}>
                Hızlı Giriş
              </Typography>
              <Typography variant="body2" className={styles.sectionSubtitle}>
                Google hesabınızla tek tıkla giriş yapın
              </Typography>
            </Box>
            
            <GoogleLoginButton />
            
            {/* Ayırıcı */}
            <Box className={styles.sectionDivider}>
              <Divider className={styles.dividerLine} />
              <Typography variant="body2" className={styles.dividerText}>
                veya
              </Typography>
            </Box>
            
            {/* E-posta ile Giriş/Kayıt Bölümü */}
            <Box className={styles.sectionHeader}>
              <Typography variant="h6" className={styles.sectionTitle}>
                E-posta ile Giriş
              </Typography>
              <Typography variant="body2" className={styles.sectionSubtitle}>
                E-posta ve şifrenizle güvenli giriş yapın
              </Typography>
            </Box>
            
            <EmailAuthForm />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
} 