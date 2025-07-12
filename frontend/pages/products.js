import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import NextLink from 'next/link';
import {
  CircularProgress,
  Fab,
  Pagination
} from '@mui/material';
import {
  Search as SearchIcon,
  KeyboardArrowUp as ArrowUpIcon,
  ArrowBack as ArrowBackIcon,
  GridView as GridViewIcon,
  ViewList as ListViewIcon
} from '@mui/icons-material';
import { useCart } from '../contexts/CartContext';
import { productService } from '../services/firestoreService';

export default function ProductsPage() {
  const router = useRouter();
  const { addToCart } = useCart();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [priceRange, setPriceRange] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const productsPerPage = 12;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const allProducts = await productService.getAllProducts();
      setProducts(allProducts);
    } catch (error) {
      console.error('Ürünler yüklenirken hata:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = !filterCategory || product.category === filterCategory;
    const matchesBrand = !filterBrand || product.brand === filterBrand;
    const matchesPrice = priceRange === 'all' || 
      (priceRange === '0-200' && product.price <= 200) ||
      (priceRange === '200-500' && product.price > 200 && product.price <= 500) ||
      (priceRange === '500+' && product.price > 500);
    
    return matchesSearch && matchesCategory && matchesBrand && matchesPrice;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'newest':
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      default:
        return 0;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const paginatedProducts = sortedProducts.slice(startIndex, startIndex + productsPerPage);

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const brands = [...new Set(products.map(p => p.brand).filter(Boolean))];
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  return (
    <>
      <Head>
        <title>Tüm Ürünler - STEP Golden Shoes</title>
        <meta name="description" content="STEP Golden Shoes tüm ürün koleksiyonu" />
      </Head>

      <div className="min-h-screen bg-black pt-12">
        {/* Header */}
        <div className="bg-dark-950 py-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center mb-6">
              <NextLink href="/">
                <button className="flex items-center text-gold-500 hover:text-gold-400 transition-colors mr-4">
                  <ArrowBackIcon className="w-5 h-5 mr-2" />
                  Ana Sayfa
                </button>
              </NextLink>
            </div>
            
            <h1 className="luxury-title text-3xl mb-4">
              Tüm Ürünler
            </h1>
            <p className="text-gray-400 text-lg">
              Ayakkabı koleksiyonumuzun tamamını keşfedin
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-dark-900 py-6 border-b border-dark-700">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              {/* Search */}
              <div className="relative md:col-span-2">
                <input
                  type="text"
                  placeholder="Ürün, marka ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-dark-800 border border-dark-600 rounded-lg py-2 pl-4 pr-10 text-white placeholder-gray-400 focus:border-gold-500 focus:outline-none"
                />
                <SearchIcon className="absolute right-3 top-2.5 text-gray-400 w-5 h-5" />
              </div>

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

              {/* Brand Filter */}
              <select
                value={filterBrand}
                onChange={(e) => setFilterBrand(e.target.value)}
                className="bg-dark-800 border border-dark-600 rounded-lg py-2 px-4 text-white focus:border-gold-500 focus:outline-none"
              >
                <option value="">Tüm Markalar</option>
                {brands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
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

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-dark-800 border border-dark-600 rounded-lg py-2 px-4 text-white focus:border-gold-500 focus:outline-none"
              >
                <option value="name">İsme Göre</option>
                <option value="price-low">Fiyat (Düşük-Yüksek)</option>
                <option value="price-high">Fiyat (Yüksek-Düşük)</option>
                <option value="newest">En Yeni</option>
              </select>
            </div>

            {/* Results & View Toggle */}
            <div className="flex justify-between items-center mt-4">
              <p className="text-gray-400">
                {filteredProducts.length} ürün bulundu
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-gold-500 text-black' 
                      : 'bg-dark-800 text-gray-400 hover:text-white'
                  }`}
                >
                  <GridViewIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-gold-500 text-black' 
                      : 'bg-dark-800 text-gray-400 hover:text-white'
                  }`}
                >
                  <ListViewIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="py-12">
          <div className="max-w-7xl mx-auto px-4">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <CircularProgress color="primary" />
              </div>
            ) : paginatedProducts.length > 0 ? (
              <>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {paginatedProducts.map((product, index) => (
                      <div
                        key={product.id}
                        className="product-card group animate-fadeInUp"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <div className="relative overflow-hidden">
                          <img
                            src={product.images && product.images.length > 0 ? product.images[0] : '/no-image.png'}
                            alt={product.name}
                            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => {
                              e.target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><defs><linearGradient id="grad${index}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%23f5b041;stop-opacity:1" /><stop offset="100%" style="stop-color:%23e89611;stop-opacity:1" /></linearGradient></defs><rect width="300" height="200" fill="url(%23grad${index})" /><text x="150" y="100" font-family="Arial" font-size="16" fill="white" text-anchor="middle" dominant-baseline="middle">Ürün</text></svg>`;
                            }}
                          />
                          {product.discount > 0 && (
                            <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                              %{product.discount}
                            </div>
                          )}
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
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                              {product.discount > 0 ? (
                                <>
                                  <span className="text-lg font-bold text-gold-500">
                                    {formatPrice(product.price - (product.price * product.discount / 100))}
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
                              onClick={() => handleAddToCart(product)}
                              className="bg-gold-500 text-black px-3 py-1.5 rounded-full font-semibold hover:bg-gold-400 transition-colors text-sm"
                            >
                              Sepete Ekle
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paginatedProducts.map((product, index) => (
                      <div
                        key={product.id}
                        className="product-card flex overflow-hidden animate-fadeInUp"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <div className="w-48 h-32 flex-shrink-0">
                          <img
                            src={product.images && product.images.length > 0 ? product.images[0] : '/no-image.png'}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="130" viewBox="0 0 200 130"><defs><linearGradient id="grad${index}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%23f5b041;stop-opacity:1" /><stop offset="100%" style="stop-color:%23e89611;stop-opacity:1" /></linearGradient></defs><rect width="200" height="130" fill="url(%23grad${index})" /><text x="100" y="65" font-family="Arial" font-size="12" fill="white" text-anchor="middle" dominant-baseline="middle">Ürün</text></svg>`;
                            }}
                          />
                        </div>
                        <div className="flex-1 p-4 flex justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white mb-2 hover:text-gold-500 transition-colors">
                              {product.name}
                            </h3>
                            {product.brand && (
                              <p className="text-gray-500 text-sm mb-2">{product.brand}</p>
                            )}
                            <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                              {product.description}
                            </p>
                            <div className="flex items-center space-x-3">
                              {product.discount > 0 ? (
                                <>
                                  <span className="text-xl font-bold text-gold-500">
                                    {formatPrice(product.price - (product.price * product.discount / 100))}
                                  </span>
                                  <span className="text-lg text-gray-500 line-through">
                                    {formatPrice(product.price)}
                                  </span>
                                  <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full font-semibold">
                                    %{product.discount} İNDİRİM
                                  </span>
                                </>
                              ) : (
                                <span className="text-xl font-bold text-gold-500">
                                  {formatPrice(product.price)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col justify-between items-end ml-4">
                            <button
                              onClick={() => handleAddToCart(product)}
                              className="bg-gold-500 text-black px-4 py-2 rounded-full font-semibold hover:bg-gold-400 transition-colors"
                            >
                              Sepete Ekle
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-12">
                    <Pagination
                      count={totalPages}
                      page={currentPage}
                      onChange={(e, page) => {
                        setCurrentPage(page);
                        scrollToTop();
                      }}
                      sx={{
                        '& .MuiPaginationItem-root': {
                          color: 'white',
                          borderColor: 'var(--dark-600)',
                          '&:hover': {
                            backgroundColor: 'var(--dark-700)',
                          },
                          '&.Mui-selected': {
                            backgroundColor: 'var(--gold-500)',
                            color: 'black',
                            fontWeight: 'bold',
                          }
                        }
                      }}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">👟</div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Aradığınız kriterlerde ürün bulunamadı
                </h3>
                <p className="text-gray-400 mb-6">
                  Filtreleri değiştirerek tekrar deneyin
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterCategory('');
                    setFilterBrand('');
                    setPriceRange('all');
                    setCurrentPage(1);
                  }}
                  className="btn-gold"
                >
                  Filtreleri Temizle
                </button>
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