import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Tabs,
  Tab,
  Divider,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar
} from '@mui/material';
import {
  ShoppingCart as OrderIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as CompletedIcon,
  Schedule as PendingIcon,
  Cancel as CancelledIcon,
  Visibility as ViewIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import { getDocs, collection } from "firebase/firestore";
import { db } from "../firebase";

export default function OrdersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetailOpen, setOrderDetailOpen] = useState(false);
  const [error, setError] = useState(null);

  // Kullanıcı giriş yapmamışsa ana sayfaya yönlendir
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Siparişleri yükle
  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      setError(null);
      const ordersSnap = await getDocs(collection(db, "orders"));
      setOrders(ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      setError('Siparişler yüklenemedi.');
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setOrderDetailOpen(true);
  };

  const handleCloseOrderDetail = () => {
    setOrderDetailOpen(false);
    setSelectedOrder(null);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <PendingIcon color="warning" />;
      case 'shipped':
        return <ShippingIcon color="info" />;
      case 'completed':
        return <CompletedIcon color="success" />;
      case 'cancelled':
        return <CancelledIcon color="error" />;
      default:
        return <OrderIcon />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'shipped':
        return 'info';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Beklemede';
      case 'shipped':
        return 'Kargoda';
      case 'completed':
        return 'Tamamlandı';
      case 'cancelled':
        return 'İptal Edildi';
      default:
        return status;
    }
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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  // Aktif ve geçmiş siparişleri ayır
  const activeOrders = orders.filter(order => 
    order.status === 'pending' || order.status === 'shipped'
  );
  
  const completedOrders = orders.filter(order => 
    order.status === 'completed' || order.status === 'cancelled'
  );

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
      <Typography variant="h4" component="h1" gutterBottom>
        Siparişlerim
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab 
            label={`Aktif Siparişler (${activeOrders.length})`} 
            icon={<PendingIcon />}
            iconPosition="start"
          />
          <Tab 
            label={`Geçmiş Siparişler (${completedOrders.length})`} 
            icon={<CompletedIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {loadingOrders ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          {activeTab === 0 && (
            <Box>
              {activeOrders.length === 0 ? (
                <Card>
                  <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <OrderIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Aktif siparişiniz bulunmuyor
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={3}>
                      Henüz bir sipariş vermediniz veya tüm siparişleriniz tamamlandı
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => router.push('/')}
                    >
                      Alışverişe Başla
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Grid container spacing={3}>
                  {activeOrders.map((order) => (
                    <Grid item xs={12} key={order.id}>
                      <Card>
                        <CardContent>
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                            <Box>
                              <Typography variant="h6" gutterBottom>
                                Sipariş #{order.id.slice(-8)}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {formatDate(order.createdAt)}
                              </Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={1}>
                              {getStatusIcon(order.status)}
                              <Chip 
                                label={getStatusText(order.status)} 
                                color={getStatusColor(order.status)}
                                size="small"
                              />
                            </Box>
                          </Box>
                          
                          <Divider sx={{ my: 2 }} />
                          
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {order.items?.length || 0} ürün
                              </Typography>
                              <Typography variant="h6" color="primary">
                                {formatPrice(order.total)}
                              </Typography>
                            </Box>
                            <Button
                              variant="outlined"
                              startIcon={<ViewIcon />}
                              onClick={() => handleViewOrder(order)}
                            >
                              Detayları Gör
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}

          {activeTab === 1 && (
            <Box>
              {completedOrders.length === 0 ? (
                <Card>
                  <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <ReceiptIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      Geçmiş siparişiniz bulunmuyor
                    </Typography>
                  </CardContent>
                </Card>
              ) : (
                <Grid container spacing={3}>
                  {completedOrders.map((order) => (
                    <Grid item xs={12} key={order.id}>
                      <Card>
                        <CardContent>
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                            <Box>
                              <Typography variant="h6" gutterBottom>
                                Sipariş #{order.id.slice(-8)}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {formatDate(order.createdAt)}
                              </Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={1}>
                              {getStatusIcon(order.status)}
                              <Chip 
                                label={getStatusText(order.status)} 
                                color={getStatusColor(order.status)}
                                size="small"
                              />
                            </Box>
                          </Box>
                          
                          <Divider sx={{ my: 2 }} />
                          
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {order.items?.length || 0} ürün
                              </Typography>
                              <Typography variant="h6" color="primary">
                                {formatPrice(order.total)}
                              </Typography>
                            </Box>
                            <Button
                              variant="outlined"
                              startIcon={<ViewIcon />}
                              onClick={() => handleViewOrder(order)}
                            >
                              Detayları Gör
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}
        </Box>
      )}

      {/* Sipariş Detay Modal */}
      <Dialog 
        open={orderDetailOpen} 
        onClose={handleCloseOrderDetail}
        maxWidth="md"
        fullWidth
      >
        {selectedOrder && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center" gap={1}>
                <ReceiptIcon />
                <Typography variant="h6">
                  Sipariş #{selectedOrder.id.slice(-8)}
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ pt: 1 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      Sipariş Bilgileri
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Sipariş Tarihi
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(selectedOrder.createdAt)}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Durum
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        {getStatusIcon(selectedOrder.status)}
                        <Chip 
                          label={getStatusText(selectedOrder.status)} 
                          color={getStatusColor(selectedOrder.status)}
                          size="small"
                        />
                      </Box>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Toplam Tutar
                      </Typography>
                      <Typography variant="h6" color="primary">
                        {formatPrice(selectedOrder.total)}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      Teslimat Adresi
                    </Typography>
                    {selectedOrder.shippingAddress ? (
                      <Box>
                        <Typography variant="body1" gutterBottom>
                          {selectedOrder.shippingAddress.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {selectedOrder.shippingAddress.fullAddress}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {selectedOrder.shippingAddress.district}, {selectedOrder.shippingAddress.city} {selectedOrder.shippingAddress.postalCode}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Adres bilgisi bulunamadı
                      </Typography>
                    )}
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom>
                  Sipariş Edilen Ürünler
                </Typography>
                
                <List>
                  {selectedOrder.items?.map((item, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar 
                          src={item.product?.images?.[0] || '/no-image.png'}
                          alt={item.product?.name}
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={item.product?.name || 'Ürün bilgisi bulunamadı'}
                        secondary={`Adet: ${item.quantity} | ${formatPrice(item.product?.price || 0)}`}
                      />
                      <Typography variant="body1" color="primary">
                        {formatPrice((item.product?.price || 0) * item.quantity)}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseOrderDetail}>
                Kapat
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
} 