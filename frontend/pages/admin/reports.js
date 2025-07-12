import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Assessment as AssessmentIcon,
  MonetizationOn as MoneyIcon,
  ShoppingCart as CartIcon,
  Inventory as InventoryIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuth } from '../../contexts/AuthContext';
import { getDocs, collection, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "../../firebase";

const StatCard = ({ title, value, change, icon, trend, color = 'primary.main' }) => (
  <Card sx={{ 
    height: '100%',
    borderRadius: 3,
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    transition: 'transform 0.2s ease-in-out',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
    }
  }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ color: color, fontSize: 40, opacity: 0.8 }}>
          {icon}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {trend === 'up' ? (
            <TrendingUpIcon sx={{ color: 'success.main', mr: 0.5 }} />
          ) : (
            <TrendingDownIcon sx={{ color: 'error.main', mr: 0.5 }} />
          )}
          <Typography 
            variant="body2" 
            color={trend === 'up' ? 'success.main' : 'error.main'}
            fontWeight={600}
          >
            {change}
          </Typography>
        </Box>
      </Box>
      <Typography variant="h4" fontWeight={700} color={color} mb={1}>
        {value}
      </Typography>
      <Typography color="text.secondary" fontSize="0.9rem" fontWeight={500}>
        {title}
      </Typography>
    </CardContent>
  </Card>
);

const CategoryChart = ({ data }) => (
  <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
    <Typography variant="h6" fontWeight={600} mb={3}>
      Kategoriye Göre Satışlar
    </Typography>
    <Box>
      {data.map((item, index) => (
        <Box key={index} sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" fontWeight={500}>{item.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {item.value}₺ ({item.percentage}%)
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={item.percentage} 
            sx={{ 
              height: 8, 
              borderRadius: 4,
              backgroundColor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                backgroundColor: `hsl(${index * 60}, 70%, 50%)`
              }
            }}
          />
        </Box>
      ))}
    </Box>
  </Paper>
);

const TopProducts = ({ products }) => (
  <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
    <Typography variant="h6" fontWeight={600} mb={3}>
      En Çok Satan Ürünler
    </Typography>
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Ürün</TableCell>
            <TableCell align="center">Satış</TableCell>
            <TableCell align="right">Gelir</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {products.map((product, index) => (
            <TableRow key={index} hover>
              <TableCell>
                <Typography variant="body2" fontWeight={500}>
                  {product.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {product.category}
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Chip 
                  label={`${product.sold} adet`} 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                />
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2" fontWeight={600} color="success.main">
                  {product.revenue.toLocaleString('tr-TR')}₺
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </Paper>
);

const RecentActivity = ({ activities }) => (
  <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
    <Typography variant="h6" fontWeight={600} mb={3}>
      Son Aktiviteler
    </Typography>
    <Box>
      {activities.map((activity, index) => (
        <Box key={index} sx={{ mb: 2, pb: 2, borderBottom: index < activities.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="body2" fontWeight={500}>
                {activity.action}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {activity.time}
              </Typography>
            </Box>
            <Chip 
              label={activity.type} 
              size="small" 
              color={
                activity.type === 'Sipariş' ? 'success' : 
                activity.type === 'Ürün' ? 'info' : 'warning'
              }
            />
          </Box>
        </Box>
      ))}
    </Box>
  </Paper>
);

export default function ReportsPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState('7days');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState({
    stats: {
      totalRevenue: 0,
      totalOrders: 0,
      totalProducts: 0,
      totalCustomers: 0,
      revenueChange: '+0%',
      ordersChange: '+0%',
      productsChange: '+0%',
      customersChange: '+0%'
    },
    categoryData: [],
    topProducts: [],
    recentActivity: []
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, [period, user]);

  const getDateFilter = (period) => {
    const now = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7days':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }
    
    return startDate;
  };

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Firebase'den verileri çek
      const [productsSnap, ordersSnap, usersSnap] = await Promise.all([
        getDocs(collection(db, "products")),
        getDocs(collection(db, "orders")),
        getDocs(collection(db, "users"))
      ]);

      const products = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const allOrders = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const users = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Zaman filtresi uygula
      const filterDate = getDateFilter(period);
      const orders = allOrders.filter(order => {
        if (!order.createdAt) return false;
        const orderDate = new Date(order.createdAt.seconds ? order.createdAt.seconds * 1000 : order.createdAt);
        return orderDate >= filterDate;
      });

      // Önceki dönem karşılaştırması için
      const prevPeriodDate = new Date(filterDate);
      prevPeriodDate.setTime(prevPeriodDate.getTime() - (Date.now() - filterDate.getTime()));
      const prevOrders = allOrders.filter(order => {
        if (!order.createdAt) return false;
        const orderDate = new Date(order.createdAt.seconds ? order.createdAt.seconds * 1000 : order.createdAt);
        return orderDate >= prevPeriodDate && orderDate < filterDate;
      });

      // İstatistikleri hesapla
      const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
      const totalOrders = orders.length;
      const totalProducts = products.filter(p => p.isActive !== false).length;
      const totalCustomers = users.filter(u => u.role !== 'admin').length;

      // Önceki dönem ile karşılaştırma
      const prevRevenue = prevOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      const prevOrderCount = prevOrders.length;
      
      const revenueChange = prevRevenue > 0 ? 
        ((totalRevenue - prevRevenue) / prevRevenue * 100).toFixed(1) : '0';
      const ordersChange = prevOrderCount > 0 ? 
        ((totalOrders - prevOrderCount) / prevOrderCount * 100).toFixed(1) : '0';

      // Kategori analizi - gerçek satış verilerine göre
      const categoryStats = {};
      orders.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach(item => {
            const product = products.find(p => p.id === item.productId);
            const category = product?.category || 'Diğer';
            if (!categoryStats[category]) {
              categoryStats[category] = { total: 0, count: 0, revenue: 0 };
            }
            categoryStats[category].total += item.quantity || 1;
            categoryStats[category].count += 1;
            categoryStats[category].revenue += (item.price || 0) * (item.quantity || 1);
          });
        }
      });

      const totalCategoryRevenue = Object.values(categoryStats).reduce((sum, cat) => sum + cat.revenue, 0);
      const categoryData = Object.entries(categoryStats)
        .map(([name, data]) => ({
          name,
          value: data.revenue,
          percentage: totalCategoryRevenue > 0 ? Math.round((data.revenue / totalCategoryRevenue) * 100) : 0,
          sold: data.total
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      // En çok satan ürünler - gerçek satış verilerine göre
      const productSales = {};
      orders.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach(item => {
            const productId = item.productId;
            if (!productSales[productId]) {
              productSales[productId] = { 
                sold: 0, 
                revenue: 0,
                product: products.find(p => p.id === productId)
              };
            }
            productSales[productId].sold += item.quantity || 1;
            productSales[productId].revenue += (item.price || 0) * (item.quantity || 1);
          });
        }
      });

      const topProducts = Object.values(productSales)
        .filter(item => item.product) // Sadece mevcut ürünler
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 5)
        .map(item => ({
          name: item.product.name,
          category: item.product.category,
          sold: item.sold,
          revenue: item.revenue
        }));

      // Son aktiviteler - gerçek verilerden
      const recentActivity = [];
      
      // Son siparişler
      const recentOrders = allOrders
        .sort((a, b) => {
          const aDate = new Date(a.createdAt?.seconds ? a.createdAt.seconds * 1000 : a.createdAt || 0);
          const bDate = new Date(b.createdAt?.seconds ? b.createdAt.seconds * 1000 : b.createdAt || 0);
          return bDate - aDate;
        })
        .slice(0, 3);

      recentOrders.forEach(order => {
        const orderDate = new Date(order.createdAt?.seconds ? order.createdAt.seconds * 1000 : order.createdAt);
        const timeAgo = getTimeAgo(orderDate);
        recentActivity.push({
          action: `Yeni sipariş alındı #${order.id.slice(-4)}`,
          type: 'Sipariş',
          time: timeAgo
        });
      });

      // Son kayıt olan kullanıcılar
      const recentUsers = users
        .filter(u => u.role !== 'admin' && u.createdAt)
        .sort((a, b) => {
          const aDate = new Date(a.createdAt?.seconds ? a.createdAt.seconds * 1000 : a.createdAt || 0);
          const bDate = new Date(b.createdAt?.seconds ? b.createdAt.seconds * 1000 : b.createdAt || 0);
          return bDate - aDate;
        })
        .slice(0, 2);

      recentUsers.forEach(user => {
        const userDate = new Date(user.createdAt?.seconds ? user.createdAt.seconds * 1000 : user.createdAt);
        const timeAgo = getTimeAgo(userDate);
        recentActivity.push({
          action: `Yeni müşteri kaydı: ${user.displayName || user.email?.split('@')[0] || 'Anonim'}`,
          type: 'Müşteri',
          time: timeAgo
        });
      });

      // Stok uyarıları
      const lowStockProducts = products.filter(product => {
        if (!product.stock || !product.isActive) return false;
        if (typeof product.stock === 'object') {
          const totalStock = Object.values(product.stock).reduce((sum, qty) => sum + Number(qty || 0), 0);
          return totalStock < 5;
        }
        return Number(product.stock) < 5;
      }).slice(0, 2);

      lowStockProducts.forEach(product => {
        recentActivity.push({
          action: `Stok uyarısı: ${product.name}`,
          type: 'Stok',
          time: 'Şimdi'
        });
      });

      setAnalyticsData({
        stats: {
          totalRevenue,
          totalOrders,
          totalProducts,
          totalCustomers,
          revenueChange: `${revenueChange >= 0 ? '+' : ''}${revenueChange}%`,
          ordersChange: `${ordersChange >= 0 ? '+' : ''}${ordersChange}%`,
          productsChange: '+0%', // Ürün sayısı değişimi hesaplanamaz
          customersChange: '+0%'  // Müşteri sayısı değişimi hesaplanamaz
        },
        categoryData,
        topProducts,
        recentActivity: recentActivity.slice(0, 10)
      });

    } catch (error) {
      console.error('Analytics veri getirme hatası:', error);
      setError('Analiz verileri yüklenirken hata oluştu');
      
      // Hata durumunda boş veriler
      setAnalyticsData({
        stats: {
          totalRevenue: 0,
          totalOrders: 0,
          totalProducts: 0,
          totalCustomers: 0,
          revenueChange: '+0%',
          ordersChange: '+0%',
          productsChange: '+0%',
          customersChange: '+0%'
        },
        categoryData: [],
        topProducts: [],
        recentActivity: []
      });
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Az önce';
    if (diffMins < 60) return `${diffMins} dakika önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays === 1) return 'Dün';
    if (diffDays < 7) return `${diffDays} gün önce`;
    return date.toLocaleDateString('tr-TR');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  if (loading) {
    return (
      <AdminLayout pageTitle="Raporlar">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle="Satış Raporları & Analitik">
      <Box>
        {error && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            {error} - Demo veriler gösteriliyor
          </Alert>
        )}

        {/* Filtre */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" fontWeight={700}>
            Analitik Dashboard
          </Typography>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Zaman Aralığı</InputLabel>
            <Select
              value={period}
              label="Zaman Aralığı"
              onChange={(e) => setPeriod(e.target.value)}
            >
              <MenuItem value="7days">Son 7 Gün</MenuItem>
              <MenuItem value="30days">Son 30 Gün</MenuItem>
              <MenuItem value="90days">Son 3 Ay</MenuItem>
              <MenuItem value="1year">Son 1 Yıl</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* İstatistik Kartları */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Toplam Gelir" 
              value={formatCurrency(analyticsData.stats.totalRevenue)}
              change={analyticsData.stats.revenueChange}
              trend="up"
              icon={<MoneyIcon />}
              color="#2e7d32"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Toplam Sipariş" 
              value={analyticsData.stats.totalOrders.toLocaleString('tr-TR')}
              change={analyticsData.stats.ordersChange}
              trend="up"
              icon={<CartIcon />}
              color="#1976d2"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Toplam Ürün" 
              value={analyticsData.stats.totalProducts.toLocaleString('tr-TR')}
              change={analyticsData.stats.productsChange}
              trend="up"
              icon={<InventoryIcon />}
              color="#ed6c02"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              title="Toplam Müşteri" 
              value={analyticsData.stats.totalCustomers.toLocaleString('tr-TR')}
              change={analyticsData.stats.customersChange}
              trend="up"
              icon={<PeopleIcon />}
              color="#9c27b0"
            />
          </Grid>
        </Grid>

        {/* Grafikler ve Tablolar */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <CategoryChart data={analyticsData.categoryData} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TopProducts products={analyticsData.topProducts} />
          </Grid>
          <Grid item xs={12}>
            <RecentActivity activities={analyticsData.recentActivity} />
          </Grid>
        </Grid>
      </Box>
    </AdminLayout>
  );
} 