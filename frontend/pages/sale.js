import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import NextLink from 'next/link';
import {
  CircularProgress,
  Fab
} from '@mui/material';
import {
  Search as SearchIcon,
  KeyboardArrowUp as ArrowUpIcon,
  ArrowBack as ArrowBackIcon,
  LocalOffer as OfferIcon
} from '@mui/icons-material';
import { useCart } from '../contexts/CartContext';
import { productService } from '../services/firestoreService';

export default function SalePage() {
  const router = useRouter();
  const { addToCart } = useCart();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('discount-high');
  const [filterCategory, setFilterCategory] = useState('');
  const [priceRange, setPriceRange] = useState('all');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const allProducts = await productService.getAllProducts();
      // İndirimli ürünleri filtrele
      const saleProducts = allProducts.filter(product => 
        product.discount && product.discount > 0
      );
      setProducts(saleProducts);
    } catch (error) {
      console.error('Ürünler yüklenirken hata:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = !filterCategory || product.category === filterCategory;
    
    const discountedPrice = product.price - (product.price * product.discount / 100);
    const matchesPrice = priceRange === 'all' || 
      (priceRange === '0-200' && discountedPrice <= 200) ||
      (priceRange === '200-500' && discountedPrice > 200 && discountedPrice <= 500) ||
      (priceRange === '500+' && discountedPrice > 500);
    
    return matchesCategory && matchesPrice;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const aDiscountedPrice = a.price - (a.price * a.discount / 100);
    const bDiscountedPrice = b.price - (b.price * b.discount / 100);
    
    switch (sortBy) {
      case 'discount-high':
        return b.discount - a.discount;
      case 'discount-low':
        return a.discount - b.discount;
      case 'price-low':
        return aDiscountedPrice - bDiscountedPrice;
      case 'price-high':
        return bDiscountedPrice - aDiscountedPrice;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  const calculateDiscountedPrice = (price, discount) => {
    return price - (price * discount / 100);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  return (
    <>
      <Head>
        <title>İndirimdeki Ürünler - STEP Golden Shoes</title>
        <meta name="description" content="İndirimli ayakkabı modelleri, özel fırsatlar" />
      </Head>

      <div className="min-h-screen bg-black pt-12">
        {/* Header */}
        <div className="bg-dark-950 py-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center mb-4">
              <OfferIcon className="text-red-500 w-8 h-8 mr-3" />
              <h1 className="luxury-title text-3xl">
                İndirimdeki Ürünler
              </h1>
            </div>
            <p className="text-gray-400 text-lg">
              Özel indirim fırsatlarını kaçırmayın!
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-dark-900 py-6 border-b border-dark-700">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-dark-800 border border-dark-600 rounded-lg py-2 px-4 text-white focus:border-gold-500 focus:outline-none"
              >
                <option value="discount-high">İndirim (Yüksek-Düşük)</option>
                <option value="discount-low">İndirim (Düşük-Yüksek)</option>
                <option value="price-low">Fiyat (Düşük-Yüksek)</option>
                <option value="price-high">Fiyat (Yüksek-Düşük)</option>
                <option value="name">İsme Göre</option>
              </select>

              {/* Category Filter */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-dark-800 border border-dark-600 rounded-lg py-2 px-4 text-white focus:border-gold-500 focus:outline-none"
              >
                <option value="">Tüm Kategoriler</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'kadin' ? 'Kadın' : 
                     category === 'erkek' ? 'Erkek' : 
                     category === 'terlik' ? 'Terlik' : category}
                  </option>
                ))}
              </select>

              {/* Price Filter */}
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="bg-dark-800 border border-dark-600 rounded-lg py-2 px-4 text-white focus:border-gold-500 focus:outline-none"
              >
                <option value="all">Tüm Fiyatlar</option>
                <option value="0-200">0-200 TL</option>
                <option value="200-500">200-500 TL</option>
                <option value="500+">500+ TL</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <p className="text-gray-400">
                {sortedProducts.length} indirimli ürün bulundu
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <CircularProgress color="primary" />
              </div>
            ) : sortedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sortedProducts.map((product, index) => {
                  const discountedPrice = calculateDiscountedPrice(product.price, product.discount);
                  
                  return (
                    <div
                      key={product.id}
                      className="product-card group animate-fadeInUp relative"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="relative overflow-hidden">
                        <img
                          src={product.images && product.images.length > 0 ? product.images[0] : '/no-image.png'}
                          alt={product.name}
                          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            e.target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><defs><linearGradient id="grad${index}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%23f5b041;stop-opacity:1" /><stop offset="100%" style="stop-color:%23e89611;stop-opacity:1" /></linearGradient></defs><rect width="300" height="200" fill="url(%23grad${index})" /><text x="150" y="100" font-family="Arial" font-size="16" fill="white" text-anchor="middle" dominant-baseline="middle">İndirimli Ürün</text></svg>`;
                          }}
                        />
                        <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                          %{product.discount} İNDİRİM
                        </div>
                        <div className="absolute top-3 left-3 bg-gold-500 text-black px-2 py-1 rounded-full text-xs font-bold">
                          {formatPrice(product.price - discountedPrice)} TASARRUF
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-base font-semibold text-white mb-2 group-hover:text-gold-500 transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                        {product.brand && (
                          <p className="text-gray-500 text-sm mb-2">{product.brand}</p>
                        )}
                        <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex flex-col">
                            <span className="text-lg font-bold text-gold-500">
                              {formatPrice(discountedPrice)}
                            </span>
                            <span className="text-sm text-gray-500 line-through">
                              {formatPrice(product.price)}
                            </span>
                          </div>
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="bg-red-500 text-white px-3 py-1.5 rounded-full font-semibold hover:bg-red-400 transition-colors text-sm"
                          >
                            Sepete Ekle
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🏷️</div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Şu anda indirimli ürün bulunmuyor
                </h3>
                <p className="text-gray-400 mb-6">
                  Yakında harika indirimleri kaçırmayın!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Scroll to Top */}
        <Fab
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-gold-500 hover:bg-gold-400 text-black"
          size="medium"
        >
          <ArrowUpIcon />
        </Fab>
      </div>
    </>
  );
} 