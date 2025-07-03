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
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuth } from '../../contexts/AuthContext';

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
    totalCustomers: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const idToken = await user?.getIdToken();
      
      // İstatistikleri getir
      const statsResponse = await fetch('http://localhost:5000/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });

      // Son siparişleri getir
      const ordersResponse = await fetch('http://localhost:5000/api/admin/recent-orders', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        setRecentOrders(ordersData);
      }
    } catch (error) {
      console.error('Dashboard veri getirme hatası:', error);
      setError('Veriler yüklenirken hata oluştu');
      
      // Demo veriler
      setStats({
        totalSales: 12450,
        totalOrders: 156,
        totalProducts: 89,
        totalCustomers: 234
      });
      
      setRecentOrders([
        {
          id: '1',
          customerName: 'Ahmet Yılmaz',
          total: 1299.99,
          status: 'pending',
          date: '2024-01-15'
        },
        {
          id: '2',
          customerName: 'Ayşe Demir',
          total: 899.99,
          status: 'completed',
          date: '2024-01-14'
        },
        {
          id: '3',
          customerName: 'Mehmet Kaya',
          total: 1899.99,
          status: 'shipped',
          date: '2024-01-13'
        }
      ]);
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
      </Box>
    </AdminLayout>
  );
};

export default AdminDashboard; 