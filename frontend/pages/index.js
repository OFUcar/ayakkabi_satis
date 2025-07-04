import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  Box,
  Chip,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Skeleton,
  Fab,
  Snackbar,
  Alert,
  Link,
  Menu,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MobileStepper
} from '@mui/material';
import {
  Search as SearchIcon,
  ShoppingCart as CartIcon,
  Person as PersonIcon,
  LocalOffer as OfferIcon,
  Star as StarIcon,
  Favorite as FavoriteIcon,
  FilterList as FilterIcon,
  WhatsApp as WhatsAppIcon,
  KeyboardArrowUp as ArrowUpIcon,
  ExitToApp as LogoutIcon,
  LocationOn as AddressIcon,
  Receipt as OrdersIcon,
  ShoppingCart as CartMenuIcon,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  Close as CloseIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import AuthModal from '../components/AuthModal';
import CartModal from '../components/CartModal';
import styles from '../styles/Home.module.css';
import { useRouter } from 'next/router';
import NextLink from 'next/link';
import { productService, categoryService } from '../services/firestoreService';
import Head from 'next/head';

const brands = ['Nike', 'Adidas', 'Puma', 'Converse', 'Vans', 'New Balance'];
const types = ['Spor Ayakkabı', 'Koşu Ayakkabısı', 'Günlük Ayakkabı', 'Skate Ayakkabısı'];

const features = [
  {
    icon: '🚚',
    title: 'Ücretsiz Kargo',
    description: '150 TL üzeri alışverişlerde ücretsiz kargo'
  },
  {
    icon: '🔄',
    title: 'Kolay İade',
    description: '30 gün içinde ücretsiz iade imkanı'
  },
  {
    icon: '🛡️',
    title: 'Güvenli Ödeme',
    description: '256-bit SSL ile güvenli ödeme'
  },
  {
    icon: '📞',
    title: '7/24 Destek',
    description: 'WhatsApp üzerinden anında destek'
  }
];

export default function Home() {
  const { user, signOut, userData, loading } = useAuth();
  const { addToCart, getCartCount } = useCart();
  const router = useRouter();
  
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [showFilters, setShowFilters] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [categories, setCategories] = useState([{ id: 'all', name: 'Tümü', icon: '👟' }]);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);

  // Scroll efekti
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const data = await productService.getAllProducts();
        setProducts(data);
      } catch (err) {
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryService.getAllCategories();
        setCategories([{ id: 'all', name: 'Tümü', icon: '👟' }, ...data.map(cat => ({ ...cat, icon: '👟' }))]);
      } catch (err) {
        setCategories([{ id: 'all', name: 'Tümü', icon: '👟' }]);
      }
    };
    fetchCategories();
  }, []);

  // Filtreleme fonksiyonu
  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesBrand = !selectedBrand || product.brand === selectedBrand;
    const matchesType = !selectedType || product.type === selectedType;
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    
    return matchesSearch && matchesCategory && matchesBrand && matchesType && matchesPrice;
  });

  const handleAddToCart = (product) => {
    // Eğer ürün detay modalından geliyorsa ve selectedSize varsa kontrol et
    if (product.selectedSize && product.stock && typeof product.stock === 'object') {
      const adet = product.stock[product.selectedSize];
      if (!adet || adet <= 0) {
        setSnackbar({ open: true, message: 'Seçtiğiniz beden stokta yok!', severity: 'error' });
        return;
      }
    }
    addToCart(product);
    setCartModalOpen(true);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryClick = (categoryId) => {
    if (categoryId === 'admin') {
      router.push('/admin');
    } else {
      setSelectedCategory(categoryId);
    }
  };

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleMenuAction = (action) => {
    handleUserMenuClose();
    switch (action) {
      case 'logout':
        handleSignOut();
        break;
      case 'addresses':
        router.push('/addresses');
        break;
      case 'orders':
        router.push('/orders');
        break;
      case 'cart':
        setCartModalOpen(true);
        break;
      default:
        break;
    }
  };

  // Yardımcı fonksiyon: Ürünün hiç stoğu var mı?
  const isProductOutOfStock = (product) => {
    if (!product || !product.stock || typeof product.stock !== 'object') return true;
    return Object.values(product.stock).every(adet => !adet || adet <= 0);
  };

  // Hydration için güvenli loading kontrolü
  if (typeof window !== 'undefined' && loading) {
    return (
      <Box className={styles.loadingContainer}>
        <CircularProgress size={60} className={styles.loadingSpinner} />
        <Typography sx={{ ml: 2 }}>Yükleniyor...</Typography>
      </Box>
    );
  }

  return (
    <div className={styles.mainContainer}>
      {/* AppBar */}
      <AppBar position="fixed" className={`${styles.appBar} ${scrolled ? styles.scrolled : ''}`}>
        <Toolbar className={styles.toolbar}>
          <Box display="flex" alignItems="center">
            <NextLink href="/" passHref legacyBehavior>
              <a style={{ display: 'flex', alignItems: 'center' }}>
                <img
                  src="/logo/stepgoldenshoes.png"
                  alt="Step Golden Shoes Logo"
                  style={{ height: 40, objectFit: 'contain' }}
                  className={styles.logoIcon}
                />
              </a>
            </NextLink>
          </Box>

          {/* Arama Bölümü */}
          <Box className={styles.searchContainer}>
            <TextField
              placeholder="Ürün, marka veya kategori ara..."
              variant="outlined"
              size="small"
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            <SearchIcon className={styles.searchIcon} />
          </Box>

          {/* Kullanıcı Bölümü */}
          <Box className={styles.userSection}>
            {console.log('[DEBUG] userData:', userData)}
            {user && userData && userData.role === 'admin' && (
              <NextLink href="/admin">
                <Button 
                  variant="outlined"
                  size="small"
                  sx={{ mr: 1, textTransform: 'none', borderColor: 'grey.400' }}
                >
                  Yönetim Paneli
                </Button>
              </NextLink>
            )}
            
            {user ? (
              <Box className={styles.userInfo}>
                <Typography className={styles.userGreeting}>
                  Merhaba, {user.displayName || user.email}
                </Typography>
                <IconButton onClick={handleUserMenuOpen} className={styles.userButton}>
                  <Avatar className={styles.userAvatar}>
                    <PersonIcon />
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={userMenuAnchor}
                  open={Boolean(userMenuAnchor)}
                  onClose={handleUserMenuClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                >
                  <MenuItem onClick={() => handleMenuAction('addresses')}>
                    <ListItemIcon>
                      <AddressIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Adreslerim</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={() => handleMenuAction('orders')}>
                    <ListItemIcon>
                      <OrdersIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Siparişlerim</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={() => handleMenuAction('cart')}>
                    <ListItemIcon>
                      <CartMenuIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Sepetim</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={() => handleMenuAction('logout')}>
                    <ListItemIcon>
                      <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Çıkış Yap</ListItemText>
                  </MenuItem>
                </Menu>
              </Box>
            ) : (
              <IconButton onClick={() => setAuthModalOpen(true)} className={styles.userButton}>
                <Avatar className={styles.userAvatar}>
                  <PersonIcon />
                </Avatar>
              </IconButton>
            )}

            {/* Sepet Butonu */}
            <IconButton 
              onClick={() => setCartModalOpen(true)} 
              className={styles.cartButton}
            >
              <CartIcon className={styles.cartIcon} />
              {getCartCount() > 0 && (
                <Box className={styles.cartBadge}>
                  {getCartCount()}
                </Box>
              )}
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <div className={styles.pageLayout}>
        {/* Sol Sidebar - Kategori Navigasyonu */}
        <aside className={styles.categoryNav}>
          <Typography variant="h6" className={styles.categoryTitle}>
            Kategoriler
          </Typography>
          <Box className={styles.categoryContainer}>
            {categories.map((category) => (
              <Chip
                key={category.id}
                label={category.name}
                onClick={() => handleCategoryClick(category.id)}
                className={`${styles.categoryChip} ${
                  selectedCategory === category.id ? styles.active : ''
                }`}
              />
            ))}
          </Box>
        </aside>

        {/* Ana İçerik */}
        <main className={styles.mainContent}>
          {/* Header Bölümü */}
          <Box className={styles.headerSection}>
            <Typography variant="h2" className={styles.mainTitle} align="center">
              Ayakkabı Dünyasına Hoş Geldiniz
            </Typography>
            <Typography variant="h6" className={styles.subtitle} align="center">
              En trend markalar, en uygun fiyatlar ve en hızlı teslimat ile tarzınızı tamamlayın
            </Typography>
          </Box>

          {/* Ürün Grid */}
          <Grid container spacing={3} className={styles.productGrid}>
            {filteredProducts.map((product) => (
              <Grid key={product.id} className={styles.productGridItem}>
                <Card className={styles.productCard} onClick={() => { setSelectedProduct(product); setSelectedSize(null); }} style={{ cursor: 'pointer' }}>
                  <Box position="relative">
                    <CardMedia
                      component="img"
                      height="250"
                      image={product.images && product.images.length > 0 ? product.images[0] : '/no-image.png'}
                      alt={product.name}
                      className={styles.productImage}
                      style={product.isActive === false ? { filter: 'grayscale(1)', opacity: 0.7 } : {}}
                    />
                    <Chip
                      label={product.category}
                      size="small"
                      className={styles.categoryChipProduct}
                    />
                    {product.discount > 0 && (
                      <Chip
                        label={`%${product.discount} İndirim`}
                        size="small"
                        color="error"
                        style={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          backgroundColor: '#dc3545',
                          color: 'white'
                        }}
                      />
                    )}
                    {product.isActive === false && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          bgcolor: 'rgba(0,0,0,0.35)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 2,
                          borderRadius: 2
                        }}
                      >
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, letterSpacing: 1 }}>
                          Stokta Yok
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  <CardContent className={styles.cardDetails}>
                    <Typography variant="h6" className={styles.productName}>
                      {product.name}
                    </Typography>
                    <Typography variant="body2" className={styles.productDesc}>
                      {product.description}
                    </Typography>
                    <Typography variant="h5" className={styles.productPrice}>
                      {product.discount > 0 ? (
                        <Box>
                          <Typography
                            component="span"
                            style={{
                              textDecoration: 'line-through',
                              color: '#6c757d',
                              fontSize: '0.8em',
                              marginRight: 8
                            }}
                          >
                            {formatPrice(product.price)}
                          </Typography>
                          {formatPrice(product.price * (1 - product.discount / 100))}
                        </Box>
                      ) : (
                        formatPrice(product.price)
                      )}
                    </Typography>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => handleAddToCart(product)}
                      className={styles.addToCartButton}
                      disabled={product.isActive === false}
                    >
                      Sepete Ekle
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Özellikler Bölümü */}
          <Box className={styles.featuresSection}>
            <Box className={styles.featuresGrid}>
              {features.map((feature, index) => (
                <Box key={index} className={styles.featureCard}>
                  <Typography variant="h2" className={styles.featureIcon}>
                    {feature.icon}
                  </Typography>
                  <Typography variant="h6" className={styles.featureTitle}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" className={styles.featureDesc}>
                    {feature.description}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </main>
      </div>

      {/* WhatsApp Butonu */}
      <Fab
        color="success"
        aria-label="WhatsApp"
        style={{
          position: 'fixed',
          bottom: 80,
          right: 16,
          zIndex: 1000
        }}
        onClick={() => window.open('https://wa.me/905522493887', '_blank')}
      >
        <WhatsAppIcon />
      </Fab>

      {/* Yukarı Çık Butonu */}
      <Fab
        color="primary"
        aria-label="Yukarı çık"
        style={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000
        }}
        onClick={scrollToTop}
      >
        <ArrowUpIcon />
      </Fab>

      {/* Modaller */}
      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      <CartModal open={cartModalOpen} onClose={() => setCartModalOpen(false)} />

      {/* Ürün Detay Modalı */}
      <Dialog
        open={!!selectedProduct}
        onClose={() => { setSelectedProduct(null); setActiveImage(0); setSelectedSize(null); }}
        maxWidth="md"
        fullWidth
      >
        {selectedProduct && (
          <>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 2 }}>
              <Typography variant="h4" fontWeight={700}>{selectedProduct.name}</Typography>
              <IconButton onClick={() => { setSelectedProduct(null); setActiveImage(0); setSelectedSize(null); }}>
                <CloseIcon fontSize="large" />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={4}>
                {/* Fotoğraf Galerisi */}
                <Box flex={1} display="flex" flexDirection="column" alignItems="center">
                  <img
                    src={selectedProduct.images && selectedProduct.images.length > 0 ? selectedProduct.images[activeImage] : '/no-image.png'}
                    alt={selectedProduct.name}
                    style={{
                      width: '100%',
                      maxWidth: 400,
                      borderRadius: 12,
                      objectFit: 'contain',
                      background: '#f5f5f5',
                      filter:
                        isProductOutOfStock(selectedProduct) ||
                        (selectedSize && selectedProduct.stock && selectedProduct.stock[selectedSize] === 0)
                          ? 'grayscale(1) opacity(0.7)'
                          : 'none'
                    }}
                  />
                  {selectedProduct.images && selectedProduct.images.length > 1 && (
                    <MobileStepper
                      variant="dots"
                      steps={selectedProduct.images.length}
                      position="static"
                      activeStep={activeImage}
                      nextButton={
                        <Button
                          size="small"
                          onClick={() => setActiveImage((prev) => Math.min(prev + 1, selectedProduct.images.length - 1))}
                          disabled={activeImage === selectedProduct.images.length - 1}
                        >
                          <KeyboardArrowRight />
                        </Button>
                      }
                      backButton={
                        <Button
                          size="small"
                          onClick={() => setActiveImage((prev) => Math.max(prev - 1, 0))}
                          disabled={activeImage === 0}
                        >
                          <KeyboardArrowLeft />
                        </Button>
                      }
                      sx={{ mt: 2, width: '100%', justifyContent: 'center' }}
                    />
                  )}
                </Box>
                {/* Ürün Bilgileri */}
                <Box flex={2}>
                  <Typography variant="h4" fontWeight={700} mb={2}>
                    {selectedProduct.name}
                  </Typography>
                  <Typography variant="h6" color="text.secondary" mb={3} sx={{ lineHeight: 1.6 }}>
                    {selectedProduct.description}
                  </Typography>
                  <Typography variant="h3" color="primary" mb={3} fontWeight={800}>
                    {formatPrice(selectedProduct.price)}
                  </Typography>
                  {selectedProduct.discount > 0 && (
                    <Chip label={`%${selectedProduct.discount} İndirim`} color="error" sx={{ mb: 3, fontSize: 18, height: 32 }} />
                  )}
                  <Box mb={3}>
                    <Typography variant="h6" color="text.secondary" mb={1}>
                      Kategori: <b style={{ color: '#222' }}>{selectedProduct.category}</b>
                    </Typography>
                    <Typography variant="h6" color="text.secondary" mb={1}>
                      Marka: <b style={{ color: '#222' }}>{selectedProduct.brand}</b>
                    </Typography>
                    <Typography variant="h6" color="text.secondary" mb={1}>
                      Tür: <b style={{ color: '#222' }}>{selectedProduct.type}</b>
                    </Typography>
                    {selectedProduct.code && (
                      <Typography variant="h6" color="text.secondary" mb={1}>
                        Ürün Kodu: <b style={{ color: '#222' }}>{selectedProduct.code}</b>
                      </Typography>
                    )}
                  </Box>
                  {/* Beden Seçimi */}
                  {selectedProduct.stock && typeof selectedProduct.stock === 'object' && (
                    <Box mb={3}>
                      <Typography variant="h6" color="text.secondary" mb={1}>
                        Beden Seçiniz:
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        {Object.entries(selectedProduct.stock).map(([beden, adet]) => (
                          <Chip
                            key={beden}
                            label={beden}
                            clickable={adet > 0 && selectedProduct.isActive !== false}
                            color={selectedSize === beden ? 'primary' : 'default'}
                            onClick={() => {
                              if (adet > 0 && selectedProduct.isActive !== false) setSelectedSize(beden);
                            }}
                            sx={{
                              fontSize: 18,
                              height: 40,
                              px: 2,
                              opacity: adet > 0 && selectedProduct.isActive !== false ? 1 : 0.4,
                              pointerEvents: adet > 0 && selectedProduct.isActive !== false ? 'auto' : 'none'
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    sx={{ fontSize: 20, py: 1.5, mt: 2 }}
                    disabled={
                      !selectedSize ||
                      (selectedSize && selectedProduct.stock && selectedProduct.stock[selectedSize] === 0) ||
                      isProductOutOfStock(selectedProduct) ||
                      selectedProduct.isActive === false
                    }
                    onClick={() => {
                      if (
                        selectedProduct &&
                        selectedSize &&
                        selectedProduct.stock &&
                        selectedProduct.stock[selectedSize] > 0 &&
                        !isProductOutOfStock(selectedProduct) &&
                        selectedProduct.isActive !== false
                      ) {
                        handleAddToCart({ ...selectedProduct, selectedSize });
                        setSelectedProduct(null);
                        setActiveImage(0);
                        setSelectedSize(null);
                      }
                    }}
                  >
                    Sepete Ekle
                  </Button>
                </Box>
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
} 