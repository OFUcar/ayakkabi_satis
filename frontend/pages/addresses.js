import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  IconButton,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Home as HomeIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import { getDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

export default function AddressesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    fullAddress: '',
    city: '',
    district: '',
    postalCode: '',
    isDefault: false
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Kullanıcı giriş yapmamışsa ana sayfaya yönlendir
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Adresleri yükle
  useEffect(() => {
    if (user) {
      fetchAddresses();
    }
  }, [user]);

  const fetchAddresses = async () => {
    try {
      setLoadingAddresses(true);
      setError(null);
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        setAddresses(userDoc.data().addresses || []);
      } else {
        setAddresses([]);
      }
    } catch (err) {
      setError('Adresler yüklenemedi.');
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleOpenModal = (address = null) => {
    if (address) {
      setEditingAddress(address);
      setFormData({
        title: address.title,
        fullAddress: address.fullAddress,
        city: address.city,
        district: address.district,
        postalCode: address.postalCode,
        isDefault: address.isDefault
      });
    } else {
      setEditingAddress(null);
      setFormData({
        title: '',
        fullAddress: '',
        city: '',
        district: '',
        postalCode: '',
        isDefault: false
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAddress(null);
    setFormData({
      title: '',
      fullAddress: '',
      city: '',
      district: '',
      postalCode: '',
      isDefault: false
    });
  };

  const handleSaveAddress = async (address) => {
    try {
      setSaving(true);
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
      let addresses = userDoc.exists() ? userDoc.data().addresses || [] : [];
      if (editingAddress) {
        // Güncelle
        addresses = addresses.map(a => a.id === editingAddress.id ? { ...a, ...address } : a);
      } else {
        // Ekle
        addresses = [...addresses, { ...address, id: Date.now().toString() }];
      }
      await updateDoc(userRef, { addresses });
      setIsModalOpen(false);
      fetchAddresses();
    } catch (err) {
      alert('Adres kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      setDeletingId(id);
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
      let addresses = userDoc.exists() ? userDoc.data().addresses || [] : [];
      addresses = addresses.filter(a => a.id !== id);
      await updateDoc(userRef, { addresses });
      fetchAddresses();
    } catch (err) {
      alert('Adres silinemedi.');
    } finally {
      setDeletingId(null);
    }
  };

  const getAddressIcon = (title) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('ev') || lowerTitle.includes('home')) return <HomeIcon />;
    if (lowerTitle.includes('iş') || lowerTitle.includes('work') || lowerTitle.includes('business')) return <BusinessIcon />;
    return <LocationIcon />;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          Adreslerim
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenModal()}
        >
          Yeni Adres Ekle
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {loadingAddresses ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : addresses.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <LocationIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Henüz adres eklenmemiş
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              İlk adresinizi ekleyerek başlayın
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenModal()}
            >
              İlk Adresimi Ekle
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {addresses.map((address) => (
            <Grid item xs={12} md={6} lg={4} key={address.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box display="flex" alignItems="center" gap={1}>
                      {getAddressIcon(address.title)}
                      <Typography variant="h6" component="h3">
                        {address.title}
                      </Typography>
                    </Box>
                    <Box>
                      {address.isDefault && (
                        <Chip label="Varsayılan" color="primary" size="small" sx={{ mb: 1 }} />
                      )}
                      <IconButton
                        size="small"
                        onClick={() => handleOpenModal(address)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteAddress(address.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {address.fullAddress}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">
                    {address.district}, {address.city} {address.postalCode}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Adres Ekleme/Düzenleme Modal */}
      <Dialog open={isModalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingAddress ? 'Adres Düzenle' : 'Yeni Adres Ekle'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              label="Adres Başlığı"
              fullWidth
              margin="dense"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Örn: Ev, İş, Anne Evi"
            />
            <TextField
              label="Tam Adres"
              fullWidth
              margin="dense"
              multiline
              rows={3}
              value={formData.fullAddress}
              onChange={(e) => setFormData({ ...formData, fullAddress: e.target.value })}
              placeholder="Sokak, mahalle, bina no, daire no"
            />
            <TextField
              label="İlçe"
              fullWidth
              margin="dense"
              value={formData.district}
              onChange={(e) => setFormData({ ...formData, district: e.target.value })}
            />
            <TextField
              label="Şehir"
              fullWidth
              margin="dense"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
            <TextField
              label="Posta Kodu"
              fullWidth
              margin="dense"
              value={formData.postalCode}
              onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                />
              }
              label="Varsayılan adres olarak ayarla"
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>İptal</Button>
          <Button onClick={() => handleSaveAddress(formData)} variant="contained">
            {editingAddress ? 'Güncelle' : 'Ekle'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 