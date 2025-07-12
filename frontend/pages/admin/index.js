import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  ShoppingCart as ShoppingCartIcon,
  Inventory as InventoryIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import AdminLayout from '../../components/admin/AdminLayout';
import StockAlerts from '../../components/admin/StockAlerts';
import { useAuth } from '../../contexts/AuthContext';
import { getDocs, collection, query, orderBy, limit } from "firebase/firestore";
import { db } from "../../firebase";

const StatCard = ({ title, value, icon, color = 'primary.main' }) => (
  <Paper 
    sx={{ 
      p: 2,
      height: '100%',
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'space-between',
      borderRadius: 3,
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      transition: 'transform 0.2s ease-in-out',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
      }
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
      <Box sx={{ color: color, fontSize: 36, opacity: 0.8 }}>
        {icon}
      </Box>
    </Box>
    <Box>
      <Typography color="text.secondary" gutterBottom fontSize="0.85rem" fontWeight={500}>
        {title}
      </Typography>
      <Typography variant="h5" component="div" fontWeight="700" color={color} mb={0.5}>
        {value}
      </Typography>
    </Box>
  </Paper>
);

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    totalStock: 0,
    lowStockItems: 0,
    outOfStockItems: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, [refreshKey]);

  const handleStockUpdate = () => {
    setRefreshKey(prev => prev + 1);
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Firestore'dan verileri çek
      const [productsSnap, ordersSnap, usersSnap] = await Promise.all([
        getDocs(collection(db, "products")),
        getDocs(collection(db, "orders")),
        getDocs(collection(db, "users"))
      ]);

      // Gerçek verilerden istatistikleri hesapla
      const orders = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const products = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const users = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const totalSales = orders.reduce((sum, order) => sum + (order.total || 0), 0);
      const totalOrders = orders.length;
      const totalProducts = products.filter(p => p.isActive !== false).length;
      const totalCustomers = users.filter(u => u.role !== 'admin').length;

      // Stok hesaplamaları
      let totalStock = 0;
      let lowStockItems = 0;
      let outOfStockItems = 0;

      products.forEach(product => {
        if (product.isActive === false) return;
        
        let productStock = 0;
        if (product.stock) {
          if (typeof product.stock === 'object') {
            // Varyant stokları topla
            productStock = Object.values(product.stock).reduce((sum, qty) => {
              return sum + Number(qty || 0);
            }, 0);
          } else {
            productStock = Number(product.stock) || 0;
          }
        }
        
        totalStock += productStock;
        
        // Stok durumu analizi
        if (productStock === 0) {
          outOfStockItems++;
        } else if (productStock <= 5) {
          lowStockItems++;
        }
      });

      setStats({
        totalSales,
        totalOrders,
        totalProducts,
        totalCustomers,
        totalStock,
        lowStockItems,
        outOfStockItems
      });

      // Son siparişleri tarih sırasına göre sırala ve formatla
      const sortedOrders = orders
        .filter(order => order.createdAt) // Sadece tarih bilgisi olan siparişler
        .sort((a, b) => {
          const aDate = new Date(a.createdAt.seconds ? a.createdAt.seconds * 1000 : a.createdAt);
          const bDate = new Date(b.createdAt.seconds ? b.createdAt.seconds * 1000 : b.createdAt);
          return bDate - aDate;
        })
        .slice(0, 5)
        .map(order => ({
          ...order,
          // Tarih formatını düzelt
          date: order.createdAt.seconds ? 
            new Date(order.createdAt.seconds * 1000).toISOString().split('T')[0] : 
            order.createdAt,
          // Müşteri adını düzelt
          customerName: order.customerName || order.shippingAddress?.fullName || 'Anonim Müşteri'
        }));

      setRecentOrders(sortedOrders);
      setError(null);
    } catch (error) {
      console.error('Dashboard veri getirme hatası:', error);
      setError('Veriler yüklenirken hata oluştu');
      // Hata durumunda boş veriler
      setStats({
        totalSales: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalCustomers: 0,
        totalStock: 0,
        lowStockItems: 0,
        outOfStockItems: 0
      });
      setRecentOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'shipped': return 'info';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Tamamlandı';
      case 'pending': return 'Beklemede';
      case 'shipped': return 'Kargoda';
      case 'cancelled': return 'İptal';
      default: return status;
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  if (loading) {
    return (
      <AdminLayout pageTitle="Dashboard">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle="Dashboard">
      <Box>
        {error && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            {error} - Demo veriler gösteriliyor
          </Alert>
        )}

        {/* İstatistik Kartları */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Toplam Satış" 
              value={formatPrice(stats.totalSales)} 
              icon={<MoneyIcon />}
              color="#2e7d32"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Toplam Sipariş" 
              value={stats.totalOrders} 
              icon={<ShoppingCartIcon />}
              color="#1976d2"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Toplam Ürün" 
              value={stats.totalProducts} 
              icon={<InventoryIcon />}
              color="#ed6c02"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Toplam Müşteri" 
              value={stats.totalCustomers} 
              icon={<PeopleIcon />}
              color="#9c27b0"
            />
          </Grid>
        </Grid>

        {/* Stok Durumu Kartları */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Toplam Stok" 
              value={stats.totalStock.toLocaleString('tr-TR')} 
              icon={<CheckCircleIcon />}
              color="#2e7d32"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Düşük Stok (≤5)" 
              value={stats.lowStockItems} 
              icon={<WarningIcon />}
              color="#ff9800"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Stokta Yok" 
              value={stats.outOfStockItems} 
              icon={<WarningIcon />}
              color="#f44336"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Stok Yeterliliği" 
              value={`${((stats.totalProducts - stats.outOfStockItems) / Math.max(stats.totalProducts, 1) * 100).toFixed(0)}%`} 
              icon={<CheckCircleIcon />}
              color="#4caf50"
            />
          </Grid>
        </Grid>
        
        {/* Stok Uyarıları ve Son Siparişler */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <StockAlerts onStockUpdate={handleStockUpdate} />
          </Grid>
          <Grid item xs={12} md={6}>
            {/* Son Siparişler */}
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <Typography variant="h6" gutterBottom fontWeight={600} mb={3}>
                Son Siparişler
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell fontWeight={600}>Sipariş No</TableCell>
                      <TableCell fontWeight={600}>Müşteri</TableCell>
                      <TableCell fontWeight={600}>Tutar</TableCell>
                      <TableCell fontWeight={600}>Durum</TableCell>
                      <TableCell fontWeight={600}>Tarih</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentOrders.map((order) => (
                      <TableRow key={order.id} hover>
                        <TableCell>#{order.id}</TableCell>
                        <TableCell>{order.customerName}</TableCell>
                        <TableCell fontWeight={600}>{formatPrice(order.total)}</TableCell>
                        <TableCell>
                          <Chip 
                            label={getStatusText(order.status)} 
                            color={getStatusColor(order.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{formatDate(order.date)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </AdminLayout>
  );
};

export default AdminDashboard; 