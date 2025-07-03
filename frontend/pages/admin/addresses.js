import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import {
  Home as HomeIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuth } from '../../contexts/AuthContext';

const AdminAddressesPage = () => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const token = await user.getIdToken();
      const response = await fetch('http://localhost:5000/api/admin/addresses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAddresses(data);
      } else {
        setError('Adresler yüklenirken hata oluştu');
      }
    } catch (error) {
      setError('Adresler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const getAddressIcon = (title) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('ev') || lowerTitle.includes('home')) return <HomeIcon />;
    if (lowerTitle.includes('iş') || lowerTitle.includes('work') || lowerTitle.includes('business')) return <BusinessIcon />;
    return <LocationIcon />;
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

  if (loading) {
    return (
      <AdminLayout>
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Kullanıcı Adresleri
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {addresses.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <LocationIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Henüz adres eklenmemiş
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Kullanıcı</TableCell>
                  <TableCell>Adres Başlığı</TableCell>
                  <TableCell>Tam Adres</TableCell>
                  <TableCell>Şehir/İlçe</TableCell>
                  <TableCell>Posta Kodu</TableCell>
                  <TableCell>Varsayılan</TableCell>
                  <TableCell>Eklenme Tarihi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {addresses.map((address) => (
                  <TableRow key={address.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <PersonIcon fontSize="small" />
                        <Typography variant="body2">
                          {address.userDisplayName || address.userEmail || address.userId}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        {getAddressIcon(address.title)}
                        <Typography variant="body2">
                          {address.title}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 200 }}>
                        {address.fullAddress}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {address.district}, {address.city}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {address.postalCode}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {address.isDefault ? (
                        <Chip label="Evet" color="primary" size="small" />
                      ) : (
                        <Chip label="Hayır" color="default" size="small" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(address.createdAt)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            İstatistikler
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h4" color="primary">
                    {addresses.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Toplam Adres
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h4" color="primary">
                    {addresses.filter(addr => addr.isDefault).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Varsayılan Adres
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h4" color="primary">
                    {new Set(addresses.map(addr => addr.userId)).size}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Adres Ekleyen Kullanıcı
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h4" color="primary">
                    {addresses.length > 0 ? 
                      (addresses.length / new Set(addresses.map(addr => addr.userId)).size).toFixed(1) : 0
                    }
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ortalama Adres/Kullanıcı
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </AdminLayout>
  );
};

export default AdminAddressesPage; 