import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Alert, 
  Select, 
  MenuItem, 
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Chip,
  IconButton,
  Divider,
  TextField,
  FormControlLabel,
  Checkbox,
  Grid,
  Snackbar
} from '@mui/material';
import { 
  LocationOn as LocationIcon,
  Home as HomeIcon,
  Business as BusinessIcon,
  Star as StarIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuth } from '../../contexts/AuthContext';
import { getDocs, collection, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";

const UsersPage = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchUsers();
  }, [user]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const usersSnap = await getDocs(collection(db, "users"));
      setUsers(usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      setError('Kullanıcılar yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (id, newRole) => {
    try {
      await updateDoc(doc(db, "users", id), { role: newRole });
      setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
    } catch (err) {
      alert('Rol güncellenemedi.');
    }
  };

  const handleViewAddresses = async (userData) => {
    try {
      setLoadingAddresses(true);
      setSelectedUser(userData);
      
      const idToken = await user.getIdToken();
      const response = await fetch('http://localhost:5000/api/admin/addresses', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Adresler yüklenemedi.');
      }
      
      const allAddresses = await response.json();
      // Sadece seçili kullanıcının adreslerini filtrele
      const userAddresses = allAddresses.filter(addr => addr.userId === userData.id);
      setAddresses(userAddresses);
      setAddressDialogOpen(true);
    } catch (err) {
      alert('Adresler yüklenirken hata oluştu: ' + err.message);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleCloseAddressDialog = () => {
    setAddressDialogOpen(false);
    setSelectedUser(null);
    setAddresses([]);
    setEditingAddressId(null);
    setEditForm({});
  };

  const handleEditAddress = (address) => {
    setEditingAddressId(address.id);
    setEditForm({
      title: address.title,
      fullAddress: address.fullAddress,
      city: address.city,
      district: address.district,
      postalCode: address.postalCode,
      isDefault: address.isDefault
    });
  };

  const handleCancelEdit = () => {
    setEditingAddressId(null);
    setEditForm({});
  };

  const handleSaveAddress = async (addressId) => {
    try {
      const idToken = await user.getIdToken();
      const response = await fetch(`http://localhost:5000/api/admin/addresses/${addressId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify(editForm)
      });

      if (!response.ok) {
        throw new Error('Adres güncellenemedi.');
      }

      // Adres listesini güncelle
      setAddresses(addresses.map(addr => 
        addr.id === addressId 
          ? { ...addr, ...editForm, updatedAt: new Date() }
          : addr
      ));

      setEditingAddressId(null);
      setEditForm({});
      setSnackbar({ open: true, message: 'Adres başarıyla güncellendi!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Adres güncellenirken hata oluştu: ' + err.message, severity: 'error' });
    }
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const columns = [
    { field: 'displayName', headerName: 'Ad Soyad', flex: 1, minWidth: 180 },
    { field: 'email', headerName: 'E-posta', flex: 1, minWidth: 220 },
    {
      field: 'role',
      headerName: 'Rol',
      width: 150,
      renderCell: (params) => (
        <Select
          value={params.value}
          onChange={(e) => handleRoleChange(params.id, e.target.value)}
          size="small"
          sx={{ width: '100%' }}
        >
          <MenuItem value="user">User</MenuItem>
          <MenuItem value="admin">Admin</MenuItem>
        </Select>
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Kayıt Tarihi',
      width: 180,
      type: 'dateTime',
      valueGetter: (params) => new Date(params.value),
      valueFormatter: (params) => new Date(params.value).toLocaleString('tr-TR'),
    },
    {
      field: 'actions',
      headerName: 'İşlemler',
      width: 150,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Button
          variant="outlined"
          size="small"
          startIcon={<LocationIcon />}
          onClick={() => handleViewAddresses(params.row)}
          disabled={loadingAddresses}
        >
          Adresler
        </Button>
      ),
    },
  ];

  if (loading) {
    return <AdminLayout pageTitle="Kullanıcılar"><CircularProgress /></AdminLayout>;
  }

  if (error) {
    return <AdminLayout pageTitle="Kullanıcılar"><Alert severity="error">{error}</Alert></AdminLayout>;
  }

  return (
    <AdminLayout pageTitle="Kullanıcılar">
      <Box sx={{ height: 650, width: '100%', backgroundColor: '#fff', borderRadius: 2 }}>
        <DataGrid
          rows={users}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          components={{ Toolbar: GridToolbar }}
          getRowId={(row) => row.id}
        />
      </Box>

      {/* Adres Detayları Dialog */}
      <Dialog 
        open={addressDialogOpen} 
        onClose={handleCloseAddressDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <LocationIcon color="primary" />
            <Typography variant="h6">
              {selectedUser?.displayName} - Adres Bilgileri
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {loadingAddresses ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : addresses.length === 0 ? (
            <Box textAlign="center" py={4}>
              <LocationIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Adres Bulunamadı
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Bu kullanıcının henüz kayıtlı adresi bulunmuyor.
              </Typography>
            </Box>
          ) : (
            <List>
              {addresses.map((address, index) => (
                <React.Fragment key={address.id}>
                  <ListItem sx={{ px: 0, py: 2 }}>
                    <Box sx={{ width: '100%' }}>
                      {editingAddressId === address.id ? (
                        // Düzenleme Formu
                        <Box>
                          <Grid container spacing={2}>
                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                label="Adres Başlığı"
                                value={editForm.title}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                                size="small"
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                label="Tam Adres"
                                value={editForm.fullAddress}
                                onChange={(e) => handleInputChange('fullAddress', e.target.value)}
                                multiline
                                rows={2}
                                size="small"
                              />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <TextField
                                fullWidth
                                label="Şehir"
                                value={editForm.city}
                                onChange={(e) => handleInputChange('city', e.target.value)}
                                size="small"
                              />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <TextField
                                fullWidth
                                label="İlçe"
                                value={editForm.district}
                                onChange={(e) => handleInputChange('district', e.target.value)}
                                size="small"
                              />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <TextField
                                fullWidth
                                label="Posta Kodu"
                                value={editForm.postalCode}
                                onChange={(e) => handleInputChange('postalCode', e.target.value)}
                                size="small"
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={editForm.isDefault}
                                    onChange={(e) => handleInputChange('isDefault', e.target.checked)}
                                  />
                                }
                                label="Varsayılan Adres"
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <Box display="flex" gap={1}>
                                <Button
                                  variant="contained"
                                  startIcon={<SaveIcon />}
                                  onClick={() => handleSaveAddress(address.id)}
                                  size="small"
                                >
                                  Kaydet
                                </Button>
                                <Button
                                  variant="outlined"
                                  startIcon={<CancelIcon />}
                                  onClick={handleCancelEdit}
                                  size="small"
                                >
                                  İptal
                                </Button>
                              </Box>
                            </Grid>
                          </Grid>
                        </Box>
                      ) : (
                        // Görüntüleme Modu
                        <Box>
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                            <Box display="flex" alignItems="center" gap={1}>
                              {address.isDefault ? (
                                <StarIcon color="warning" fontSize="small" />
                              ) : (
                                <HomeIcon color="action" fontSize="small" />
                              )}
                              <Typography variant="h6" component="div">
                                {address.title}
                              </Typography>
                              {address.isDefault && (
                                <Chip 
                                  label="Varsayılan" 
                                  color="warning" 
                                  size="small" 
                                  variant="outlined"
                                />
                              )}
                            </Box>
                            <IconButton
                              size="small"
                              onClick={() => handleEditAddress(address)}
                              color="primary"
                            >
                              <EditIcon />
                            </IconButton>
                          </Box>
                          
                          <Typography variant="body1" gutterBottom>
                            {address.fullAddress}
                          </Typography>
                          
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {address.district}, {address.city} {address.postalCode}
                          </Typography>
                          
                          <Box display="flex" gap={2} mt={1}>
                            <Typography variant="caption" color="text.secondary">
                              Oluşturulma: {formatDate(address.createdAt)}
                            </Typography>
                            {address.updatedAt && address.updatedAt !== address.createdAt && (
                              <Typography variant="caption" color="text.secondary">
                                Güncellenme: {formatDate(address.updatedAt)}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </ListItem>
                  {index < addresses.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddressDialog}>
            Kapat
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Bildirimleri */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AdminLayout>
  );
};

export default UsersPage; 