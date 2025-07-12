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
  Close as CloseIcon,
  Menu as MenuIcon
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
  const [productDetailModal, setProductDetailModal] = useState(false);

  // Hero görseller için kategoriler (placeholder renkler ile)
  const heroCategories = [
    { 
      name: 'Kadın', 
      image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=300&fit=crop',
      color: 'from-pink-500 to-rose-500',
      link: '/category/kadin' 
    },
    { 
      name: 'Erkek', 
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=300&fit=crop',
      color: 'from-blue-600 to-blue-800',
      link: '/category/erkek' 
    },
    { 
      name: 'Terlik', 
      image: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=400&h=300&fit=crop',
      color: 'from-green-500 to-emerald-600',
      link: '/category/terlik' 
    }
  ];

  // Navigasyon menüsü
  const navigationItems = [
    { name: 'Kadın', href: '/category/kadin' },
    { name: 'Erkek', href: '/category/erkek' },
    { name: 'Terlik', href: '/category/terlik' },
    { name: 'İndirimdekiler', href: '/sale' },
    { name: 'İletişim', href: '/contact' }
  ];

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
        setProducts(data.slice(0, 6)); // İlk 6 ürünü göster
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
    window.scrollTo({ 
      top: 0, 
      behavior: 'smooth',
      // Daha yumuşak scroll için ekstra seçenekler
      ...(window.CSS && CSS.supports('scroll-behavior', 'smooth') ? {} : {
        left: 0,
        behavior: 'auto'
      })
    });
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
      case 'addresses':
        router.push('/addresses');
        break;
      case 'orders':
        router.push('/orders');
        break;
      case 'cart':
        setCartModalOpen(true);
        break;
      case 'logout':
        handleSignOut();
        break;
    }
  };

  // Yardımcı fonksiyon: Ürünün hiç stoğu var mı?
  const isProductOutOfStock = (product) => {
    if (!product || !product.stock || typeof product.stock !== 'object') return true;
    return Object.values(product.stock).every(adet => !adet || adet <= 0);
  };

  const handleShopNow = () => {
    // Scroll to products section with enhanced smooth scrolling
    const productsSection = document.getElementById('products-section');
    if (productsSection) {
      // Navbar yüksekliğini hesaba katarak offset ekle
      const navbarHeight = 48; // 12 * 4 = 48px (h-12)
      const elementPosition = productsSection.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const openProductDetail = (product) => {
    setSelectedProduct(product);
    setActiveImage(0);
    setSelectedSize(null);
    setProductDetailModal(true);
  };

  const closeProductDetail = () => {
    setProductDetailModal(false);
    setSelectedProduct(null);
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
    <>
      <Head>
        <title>STEP Golden Shoes - Şıklığın Adımlarını At</title>
        <meta name="description" content="Spor ve günlük ayakkabılarla tarzını ortaya koy" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-black">
        {/* Navigation Header */}
        <nav className="fixed top-0 w-full z-50 header">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-10">
              {/* Logo */}
              <div className="flex items-center">
                <NextLink href="/">
                  <div className="flex items-center cursor-pointer">
                    <img
                      src="/logo/stepgoldenshoes.png"
                      alt="Step Golden Shoes"
                      className="h-5 w-auto"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                </NextLink>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-3">
                {navigationItems.map((item) => (
                  <NextLink key={item.name} href={item.href}>
                    <span className="nav-link cursor-pointer text-xs">
                      {item.name}
                    </span>
                  </NextLink>
                ))}
              </div>

              {/* Search Bar */}
              <div className="hidden lg:flex items-center max-w-xs mx-2">
                <div className="relative w-full">
                  <input
                    type="text"
                    placeholder="Ürün ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-dark-800 border border-dark-600 rounded-full py-1 pl-3 pr-8 text-xs text-white placeholder-gray-400 focus:border-gold-500 focus:outline-none transition-colors"
                  />
                  <SearchIcon className="absolute right-2 top-1 text-gray-400 w-3 h-3" />
                </div>
              </div>

              {/* User Actions */}
              <div className="flex items-center space-x-1">
                {/* Admin Panel Button */}
                {user && userData && userData.role === 'admin' && (
                  <NextLink href="/admin">
                    <button 
                      className="flex items-center space-x-2 px-4 py-2 rounded-xl font-bold transition-all duration-300 text-sm shadow-lg border backdrop-blur-sm hover:scale-105 transform hover:shadow-xl" 
                      style={{ 
                        backgroundColor: '#e89611', 
                        color: '#000', 
                        borderColor: '#e89611',
                        minWidth: '120px',
                        height: '44px'
                      }}
                    >
                      <span style={{ fontSize: '16px' }}>⚙️</span>
                      <span>Yönetim</span>
                    </button>
                  </NextLink>
                )}

                {/* User Menu */}
                {user ? (
                  <div className="relative">
                    <button
                      onClick={handleUserMenuOpen}
                      className="relative backdrop-blur-sm transition-all duration-300 rounded-xl hover:scale-105 transform hover:shadow-xl flex items-center justify-center"
                      style={{ 
                        backgroundColor: '#e89611', 
                        color: '#000', 
                        border: '1px solid #e89611',
                        width: '44px',
                        height: '44px'
                      }}
                    >
                      <Avatar className="w-7 h-7 border-2 shadow-lg" style={{ backgroundColor: '#e89611', color: '#000', borderColor: '#e89611' }}>
                        <PersonIcon className="w-5 h-5" style={{ color: '#000' }} />
                      </Avatar>
                    </button>
                    <Menu
                      anchorEl={userMenuAnchor}
                      open={Boolean(userMenuAnchor)}
                      onClose={handleUserMenuClose}
                      className="mt-2"
                      PaperProps={{
                        style: {
                          backgroundColor: 'var(--dark-900)',
                          border: '1px solid var(--dark-700)',
                          color: 'white'
                        }
                      }}
                    >
                      <MenuItem onClick={() => handleMenuAction('addresses')}>
                        <ListItemIcon>
                          <AddressIcon className="text-gold-500" style={{ fontSize: '22px' }} />
                        </ListItemIcon>
                        <ListItemText>Adreslerim</ListItemText>
                      </MenuItem>
                      <MenuItem onClick={() => handleMenuAction('orders')}>
                        <ListItemIcon>
                          <OrdersIcon className="text-gold-500" style={{ fontSize: '22px' }} />
                        </ListItemIcon>
                        <ListItemText>Siparişlerim</ListItemText>
                      </MenuItem>
                      <MenuItem onClick={() => handleMenuAction('cart')}>
                        <ListItemIcon>
                          <CartMenuIcon className="text-gold-500" style={{ fontSize: '22px' }} />
                        </ListItemIcon>
                        <ListItemText>Sepetim</ListItemText>
                      </MenuItem>
                      <MenuItem onClick={() => handleMenuAction('logout')}>
                        <ListItemIcon>
                          <LogoutIcon className="text-gold-500" style={{ fontSize: '22px' }} />
                        </ListItemIcon>
                        <ListItemText>Çıkış Yap</ListItemText>
                      </MenuItem>
                    </Menu>
                  </div>
                ) : (
                  <button
                    onClick={() => setAuthModalOpen(true)}
                    className="flex items-center space-x-2 bg-gradient-to-r from-gold-500 to-gold-600 text-black px-3 py-2 rounded-xl font-bold hover:from-gold-400 hover:to-gold-500 transition-all duration-300 text-sm shadow-lg hover:shadow-gold-500/50 border border-gold-400/30 backdrop-blur-sm hover:scale-105 transform"
                  >
                    <PersonIcon className="w-5 h-5 text-black" />
                    <span>Giriş</span>
                  </button>
                )}

                {/* Cart */}
                <button
                  onClick={() => setCartModalOpen(true)}
                  className="relative backdrop-blur-sm transition-all duration-300 rounded-xl hover:scale-105 transform hover:shadow-xl flex items-center justify-center"
                  style={{ 
                    backgroundColor: '#e89611', 
                    color: '#000', 
                    border: '1px solid #e89611',
                    width: '44px',
                    height: '44px'
                  }}
                >
                  <CartIcon className="w-6 h-6" style={{ color: '#000' }} />
                  {getCartCount() > 0 && (
                    <span className="absolute -top-2 -right-2 text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg" style={{ backgroundColor: '#FF4444', color: '#FFF', borderColor: '#FF4444', fontSize: '10px' }}>
                      {getCartCount()}
                    </span>
                  )}
                </button>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="md:hidden bg-gradient-to-r from-gold-500/20 to-gold-600/20 border border-gold-500/40 backdrop-blur-sm text-gold-400 hover:text-gold-300 transition-all duration-300 p-3 rounded-xl hover:scale-105 transform hover:shadow-lg hover:shadow-gold-500/30"
                >
                  <MenuIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="hero-section pt-10">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=1080&fit=crop"
              alt="Luxury Fashion"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-hero-gradient"></div>
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
            <div className="animate-fadeInUp">
              <h1 className="luxury-title mb-6">
                ŞIKLIĞIN ADIMLARINI AT
              </h1>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Spor ve günlük ayakkabılarla tarzını ortaya koy
              </p>
              <button onClick={handleShopNow} className="btn-gold">
                Şık Alışveriş
              </button>
            </div>
          </div>
        </section>

        {/* Category Cards */}
        <section className="py-20 bg-black">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {heroCategories.map((category, index) => (
                <NextLink key={category.name} href={category.link}>
                  <div
                    className="product-card group cursor-pointer animate-fadeInUp"
                    style={{ animationDelay: `${index * 0.2}s` }}
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><defs><linearGradient id="grad${index}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%23f5b041;stop-opacity:1" /><stop offset="100%" style="stop-color:%23e89611;stop-opacity:1" /></linearGradient></defs><rect width="400" height="300" fill="url(%23grad${index})" /><text x="200" y="150" font-family="Arial" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle">${category.name}</text></svg>`;
                        }}
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-all duration-300"></div>
                      <div className="absolute bottom-6 left-6">
                        <h3 className="text-2xl font-luxury text-white mb-2">
                          {category.name}
                        </h3>
                        <button className="bg-gold-500 text-black px-6 py-2 rounded-full font-semibold hover:bg-gold-400 transition-colors">
                          Keşfet
                        </button>
                      </div>
                    </div>
                  </div>
                </NextLink>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section id="products-section" className="py-24 bg-gradient-to-b from-dark-950 via-dark-900 to-black">
          <div className="max-w-7xl mx-auto px-4">
            {/* Enhanced Header */}
            <div className="text-center mb-16">
              <div className="inline-block mb-6">
                <span className="bg-gold-500/10 text-gold-500 px-4 py-2 rounded-full text-sm font-medium border border-gold-500/20">
                  ⭐ VİTRİNİMİZ
                </span>
              </div>
              <h2 className="text-5xl md:text-6xl font-luxury text-white mb-6 leading-tight">
                Öne Çıkan
                <span className="block text-gold-500">Koleksiyonumuz</span>
              </h2>
              <p className="text-gray-400 text-xl max-w-3xl mx-auto leading-relaxed">
                En çok tercih edilen, trend olan ve size özel seçtiğimiz 
                <span className="text-gold-500 font-semibold"> premium ayakkabı modellerimizi</span> keşfedin
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-gold-400 to-gold-600 mx-auto mt-8 rounded-full"></div>
            </div>

            {loadingProducts ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {Array.from({ length: 8 }, (_, index) => (
                  <div
                    key={index}
                    className="bg-dark-900/50 rounded-2xl overflow-hidden border border-dark-700/50 animate-pulse"
                  >
                    <div className="aspect-square bg-dark-800"></div>
                    <div className="p-6">
                      <div className="h-4 bg-dark-800 rounded mb-3"></div>
                      <div className="h-3 bg-dark-800 rounded mb-4 w-3/4"></div>
                      <div className="flex items-center justify-between">
                        <div className="h-4 bg-dark-800 rounded w-20"></div>
                        <div className="h-8 bg-dark-800 rounded w-24"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {products.length > 0 ? products.slice(0, 8).map((product, index) => (
                  <div
                    key={product.id}
                    className="group bg-dark-900/80 backdrop-blur-sm rounded-2xl overflow-hidden border border-dark-700/50 hover:border-gold-500/50 hover:shadow-2xl hover:shadow-gold-500/20 transition-all duration-500 hover:-translate-y-2 animate-fadeInUp"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div 
                      className="relative overflow-hidden aspect-square rounded-t-2xl cursor-pointer"
                      onClick={() => openProductDetail(product)}
                    >
                      <img
                        src={product.images && product.images.length > 0 ? product.images[0] : '/no-image.png'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 rounded-t-2xl"
                        onError={(e) => {
                          e.target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><defs><linearGradient id="grad${index}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%23f5b041;stop-opacity:1" /><stop offset="100%" style="stop-color:%23e89611;stop-opacity:1" /></linearGradient></defs><rect width="300" height="300" fill="url(%23grad${index})" /><text x="150" y="150" font-family="Arial" font-size="18" fill="white" text-anchor="middle" dominant-baseline="middle">Premium Ayakkabı</text></svg>`;
                        }}
                      />
                      
                      {/* Discount Badge */}
                      {product.discount > 0 && (
                        <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                          %{product.discount} İNDİRİM
                        </div>
                      )}
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-t-2xl"></div>
                      
                      {/* Premium Gradient for first 3 products */}
                      {index < 3 && (
                        <div className="absolute inset-0 bg-gradient-to-br from-gold-500/15 via-gold-600/8 to-transparent rounded-t-2xl pointer-events-none"></div>
                      )}
                    </div>
                    
                    <div className="p-4 flex flex-col justify-between h-24">
                      <h3 className="text-base font-bold text-white mb-2 group-hover:text-gold-500 transition-colors duration-300 line-clamp-2 leading-tight">
                        {product.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          {product.discount > 0 ? (
                            <>
                              <span className="text-lg font-bold text-gold-500">
                                {formatPrice(product.price * (1 - product.discount / 100))}
                              </span>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-500 line-through">
                                  {formatPrice(product.price)}
                                </span>
                                <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full font-semibold">
                                  %{product.discount} İNDİRİM
                                </span>
                              </div>
                            </>
                          ) : (
                            <span className="text-lg font-bold text-gold-500">
                              {formatPrice(product.price)}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(product);
                          }}
                          className="bg-gold-500 hover:bg-gold-400 text-black px-4 py-2 rounded-lg font-semibold transition-colors text-sm"
                        >
                          Sepete Ekle
                        </button>
                      </div>
                    </div>
                  </div>
                )) : (
                  // Enhanced Placeholder products
                  Array.from({ length: 8 }, (_, index) => (
                    <div
                      key={index}
                      className="group bg-dark-900/80 backdrop-blur-sm rounded-2xl overflow-hidden border border-dark-700/50 hover:border-gold-500/50 hover:shadow-2xl hover:shadow-gold-500/20 transition-all duration-500 hover:-translate-y-2 animate-fadeInUp"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        <div className="relative overflow-hidden aspect-square rounded-t-2xl cursor-pointer">
                          <div className="w-full h-full bg-gradient-to-br from-gold-600 to-gold-800 flex items-center justify-center rounded-t-2xl">
                            <div className="text-center">
                              <div className="text-4xl mb-2">👟</div>
                              <span className="text-black font-bold text-sm">Premium Model {index + 1}</span>
                            </div>
                          </div>
                          
                          {/* Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-t-2xl"></div>
                          
                          {/* Premium Gradient for first 3 placeholder products */}
                          {index < 3 && (
                            <div className="absolute inset-0 bg-gradient-to-br from-gold-500/15 via-gold-600/8 to-transparent rounded-t-2xl pointer-events-none"></div>
                          )}
                        </div>
                      
                      <div className="p-4 flex flex-col justify-between h-24">
                        <h3 className="text-base font-bold text-white mb-2 group-hover:text-gold-500 transition-colors duration-300 line-clamp-2 leading-tight">
                          Premium Ayakkabı {index + 1}
                        </h3>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-gold-500">
                            ₺{((index + 1) * 250 + 150).toLocaleString('tr-TR')}
                          </span>
                          <button className="bg-gold-500 hover:bg-gold-400 text-black px-4 py-2 rounded-lg font-semibold transition-colors text-sm cursor-not-allowed opacity-75">
                            Sepete Ekle
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Enhanced CTA Section */}
            <div className="text-center mt-16">
              <div className="bg-gradient-to-r from-dark-900/50 to-dark-800/50 backdrop-blur-sm rounded-3xl p-8 border border-dark-700/50">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Daha Fazla Model Keşfet
                </h3>
                <p className="text-gray-400 mb-6 text-lg">
                  500+ farklı model arasından size en uygun olanı bulun
                </p>
                <NextLink href="/products">
                  <button className="btn-gold text-lg px-8 py-4 hover:scale-105 transition-transform duration-300">
                    Tüm Koleksiyonu İncele
                    <span className="ml-2">→</span>
                  </button>
                </NextLink>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-black">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {[
                { icon: '🚚', title: 'Ücretsiz Kargo', desc: '150 TL üzeri siparişlerde' },
                { icon: '🔄', title: 'Kolay İade', desc: '30 gün iade garantisi' },
                { icon: '🛡️', title: 'Güvenli Ödeme', desc: '256-bit SSL koruması' },
                { icon: '📞', title: '7/24 Destek', desc: 'WhatsApp canlı destek' }
              ].map((feature, index) => (
                <div
                  key={index}
                  className="text-center p-4 md:p-6 rounded-xl bg-black border border-dark-700 hover:border-gold-500/50 hover:scale-105 transition-all duration-300"
                >
                  <div className="text-3xl md:text-4xl mb-3 md:mb-4">{feature.icon}</div>
                  <h3 className="text-base md:text-lg font-semibold text-gold-500 mb-1 md:mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-xs md:text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-black border-t border-gold-500/20 py-6">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="mb-4">
              <img
                src="/logo/stepgoldenshoes.png"
                alt="Step Golden Shoes"
                className="h-4 w-auto mx-auto mb-2"
              />
              <p className="text-gray-400 text-xs">
                Şıklığın ve konforun buluştuğu nokta
              </p>
            </div>
            <div className="text-xs text-gray-500">
              © 2024 Step Golden Shoes. Tüm hakları saklıdır.
            </div>
          </div>
        </footer>

        {/* Floating WhatsApp Button */}
        <a
          href="https://wa.me/905522493887"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 1000,
            backgroundColor: '#25D366',
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            transition: 'all 0.3s ease',
            textDecoration: 'none'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#128C7E';
            e.target.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#25D366';
            e.target.style.transform = 'scale(1)';
          }}
        >
          <WhatsAppIcon style={{ color: 'white', fontSize: '30px' }} />
        </a>

        {/* Floating Scroll to Top Button */}
        {scrolled && (
          <button
            onClick={scrollToTop}
            style={{
              position: 'fixed',
              bottom: '90px',
              right: '20px',
              zIndex: 1000,
              backgroundColor: 'var(--gold-500)',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'var(--gold-400)';
              e.target.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'var(--gold-500)';
              e.target.style.transform = 'scale(1)';
            }}
            aria-label="Yukarı git"
          >
            <ArrowUpIcon style={{ color: 'black', fontSize: '24px' }} />
          </button>
        )}

        {/* Mobile Menu */}
        <Dialog
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          fullScreen
          className="md:hidden"
        >
          <DialogContent className="bg-black p-0">
            <div className="flex justify-between items-center p-4 border-b border-gold-500/20">
              <span className="text-gold-500 font-luxury text-xl font-bold">
                STEP
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-white hover:text-gold-500"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {navigationItems.map((item) => (
                <NextLink key={item.name} href={item.href}>
                  <div
                    className="block py-3 text-white hover:text-gold-500 transition-colors border-b border-dark-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </div>
                </NextLink>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Modals */}
        <AuthModal
          open={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
        />
        <CartModal
          open={cartModalOpen}
          onClose={() => setCartModalOpen(false)}
        />

        {/* Product Detail Modal */}
        <Dialog
          open={productDetailModal}
          onClose={closeProductDetail}
          maxWidth="md"
          fullWidth
          PaperProps={{
            style: {
              backgroundColor: 'var(--dark-900)',
              border: '1px solid var(--dark-700)',
              borderRadius: '1rem'
            }
          }}
        >
          {selectedProduct && (
            <>
              <DialogTitle className="border-b border-dark-700">
                <div className="flex items-center justify-between">
                  <span className="text-white text-xl font-bold">{selectedProduct.name}</span>
                  <IconButton onClick={closeProductDetail} className="text-white">
                    <CloseIcon />
                  </IconButton>
                </div>
              </DialogTitle>
              
              <DialogContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Product Images */}
                  <div className="space-y-4">
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-dark-800">
                      <img
                        src={selectedProduct.images && selectedProduct.images.length > 0 
                          ? selectedProduct.images[activeImage] 
                          : '/no-image.png'
                        }
                        alt={selectedProduct.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><defs><linearGradient id="gradModal" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%23f5b041;stop-opacity:1" /><stop offset="100%" style="stop-color:%23e89611;stop-opacity:1" /></linearGradient></defs><rect width="400" height="400" fill="url(%23gradModal)" /><text x="200" y="200" font-family="Arial" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle">${selectedProduct.name}</text></svg>`;
                        }}
                      />
                      
                      {/* Image Navigation */}
                      {selectedProduct.images && selectedProduct.images.length > 1 && (
                        <>
                          <button
                            onClick={() => setActiveImage(prev => prev > 0 ? prev - 1 : selectedProduct.images.length - 1)}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                          >
                            <KeyboardArrowLeft />
                          </button>
                          <button
                            onClick={() => setActiveImage(prev => prev < selectedProduct.images.length - 1 ? prev + 1 : 0)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                          >
                            <KeyboardArrowRight />
                          </button>
                        </>
                      )}
                    </div>
                    
                    {/* Image Thumbnails */}
                    {selectedProduct.images && selectedProduct.images.length > 1 && (
                      <div className="grid grid-cols-4 gap-2">
                        {selectedProduct.images.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setActiveImage(index)}
                            className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                              activeImage === index ? 'border-gold-500' : 'border-dark-600 hover:border-gold-500/50'
                            }`}
                          >
                            <img
                              src={image}
                              alt={`${selectedProduct.name} ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Product Details */}
                  <div className="space-y-6">
                    {/* Price */}
                    <div>
                      {selectedProduct.discount > 0 ? (
                        <div className="flex items-center space-x-3">
                          <span className="text-3xl font-bold text-gold-500">
                            {formatPrice(selectedProduct.price * (1 - selectedProduct.discount / 100))}
                          </span>
                          <span className="text-xl text-gray-500 line-through">
                            {formatPrice(selectedProduct.price)}
                          </span>
                          <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                            %{selectedProduct.discount} İNDİRİM
                          </span>
                        </div>
                      ) : (
                        <span className="text-3xl font-bold text-gold-500">
                          {formatPrice(selectedProduct.price)}
                        </span>
                      )}
                    </div>
                    
                    {/* Category & Brand */}
                    <div className="flex flex-wrap gap-4 text-sm">
                      {selectedProduct.category && (
                        <div className="bg-dark-800 px-3 py-1 rounded-full">
                          <span className="text-gray-400">Kategori: </span>
                          <span className="text-white capitalize">{selectedProduct.category}</span>
                        </div>
                      )}
                      {selectedProduct.brand && (
                        <div className="bg-dark-800 px-3 py-1 rounded-full">
                          <span className="text-gray-400">Marka: </span>
                          <span className="text-white">{selectedProduct.brand}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Description */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Ürün Açıklaması</h3>
                      <p className="text-gray-400 leading-relaxed">
                        {selectedProduct.description || 'Bu ürün için detaylı açıklama henüz eklenmemiştir.'}
                      </p>
                    </div>
                    
                    {/* Size Selection */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Beden Seçiniz</h3>
                      <div className="grid grid-cols-5 gap-2">
                        {selectedProduct.stock && typeof selectedProduct.stock === 'object' ? 
                          Object.entries(selectedProduct.stock).map(([size, quantity]) => (
                            <button
                              key={size}
                              onClick={() => setSelectedSize(size)}
                              disabled={!quantity || quantity <= 0}
                              className={`py-3 px-2 rounded-lg border-2 font-semibold transition-all ${
                                selectedSize === size
                                  ? 'border-gold-500 bg-gold-500 text-black'
                                  : (!quantity || quantity <= 0)
                                  ? 'border-gray-600 bg-gray-700 text-gray-500 cursor-not-allowed'
                                  : 'border-dark-600 bg-dark-800 text-white hover:border-gold-500/50'
                              }`}
                            >
                              {size}
                            </button>
                          )) :
                          // Default sizes if no stock info
                          ['38', '39', '40', '41', '42', '43', '44', '45'].map(size => (
                            <button
                              key={size}
                              onClick={() => setSelectedSize(size)}
                              className={`py-3 px-2 rounded-lg border-2 font-semibold transition-all ${
                                selectedSize === size
                                  ? 'border-gold-500 bg-gold-500 text-black'
                                  : 'border-dark-600 bg-dark-800 text-white hover:border-gold-500/50'
                              }`}
                            >
                              {size}
                            </button>
                          ))
                        }
                      </div>
                      {!selectedSize && (
                        <p className="text-red-400 text-sm mt-2">* Lütfen bir beden seçiniz</p>
                      )}
                    </div>
                  </div>
                </div>
              </DialogContent>
              
              <DialogActions className="border-t border-dark-700 p-6">
                <div className="flex space-x-4 w-full">
                  <button
                    onClick={closeProductDetail}
                    className="flex-1 bg-dark-800 hover:bg-dark-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
                  >
                    Kapat
                  </button>
                  <button
                    onClick={() => {
                      if (selectedSize) {
                        const productWithSize = { ...selectedProduct, selectedSize };
                        handleAddToCart(productWithSize);
                        closeProductDetail();
                      } else {
                        setSnackbar({ open: true, message: 'Lütfen bir beden seçiniz!', severity: 'error' });
                      }
                    }}
                    disabled={!selectedSize}
                    className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                      selectedSize
                        ? 'bg-gold-500 hover:bg-gold-400 text-black hover:scale-105'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Sepete Ekle
                  </button>
                </div>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.severity}
            sx={{ 
              backgroundColor: snackbar.severity === 'error' ? '#dc2626' : '#16a34a',
              color: 'white',
              '& .MuiAlert-icon': { color: 'white' }
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </div>
    </>
  );
} 