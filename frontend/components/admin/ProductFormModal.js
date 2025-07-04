import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  IconButton,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Chip,
  OutlinedInput,
  Autocomplete
} from '@mui/material';
import { AddPhotoAlternate as AddPhotoIcon, Close as CloseIcon } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { storage } from '../../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const ProductFormModal = ({ open, onClose, onSave, product }) => {
  const [formData, setFormData] = useState({});
  const [selectedImages, setSelectedImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [model, setModel] = useState(product ? product.model || '' : '');
  const [stockPerSize, setStockPerSize] = useState({});

  // Kategorileri ve Markaları Çek
  useEffect(() => {
    if (!open) return;
    const fetchDropdownData = async () => {
      try {
        const catResponse = await fetch('http://localhost:5000/api/categories');
        const brandResponse = await fetch('http://localhost:5000/api/brands');
        if (catResponse.ok) setCategories(await catResponse.json());
        if (brandResponse.ok) setBrands(await brandResponse.json());
      } catch (error) {
        console.error("Kategori/Marka verisi çekilemedi:", error);
      }
    };
    fetchDropdownData();
  }, [open]);

  useEffect(() => {
    if (product) {
      // Düzenleme modu: Mevcut ürün verilerini forma doldur
      setFormData({
        ...product,
        sizes: product.sizes || [] // sizes tanımsız değilse boş array ata
      });
      setSelectedImages(product.images || []);
      setModel(product.model || '');
      setStockPerSize(product.stock || {});
    } else {
      // Ekleme modu: Formu sıfırla
      setFormData({
        name: '',
        sku: '',
        price: '',
        description: '',
        category: '',
        brand: '',
        sizes: []
      });
      setSelectedImages([]);
      setModel('');
      setStockPerSize({});
    }
  }, [product, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSizeChange = (event) => {
    const {
      target: { value },
    } = event;
    setFormData(prev => ({
        ...prev,
        sizes: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  // Dropzone fonksiyonu
  const onDrop = (acceptedFiles) => {
    if (selectedImages.length + acceptedFiles.length > 15) {
      alert('En fazla 15 fotoğraf yükleyebilirsiniz.');
      return;
    }
    setSelectedImages(prev => [...prev, ...acceptedFiles]);
  };
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: true,
    maxFiles: 15
  });

  const handleRemoveImage = (index) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  const uploadImagesAndGetUrls = async (images) => {
    try {
      const uploadPromises = images.map(async (img) => {
        if (typeof img === 'string') return img;
        if (img instanceof File) {
          // Storage'a yükle
          const storageRef = ref(storage, `products/${Date.now()}_${img.name}`);
          await uploadBytes(storageRef, img);
          const url = await getDownloadURL(storageRef);
          return url;
        }
        return null;
      });
      return (await Promise.all(uploadPromises)).filter(Boolean);
    } catch (error) {
      console.error('Dosya yükleme hatası:', error);
      throw new Error('Dosyalar yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const handleStockChange = (size, value) => {
    setStockPerSize(prev => ({ ...prev, [size]: value }));
  };

  const handleSubmit = async () => {
    // Fotoğrafları Storage'a yükle ve URL'leri al
    const imageUrls = await uploadImagesAndGetUrls(selectedImages);
    const finalData = {
      ...formData,
      price: Number(formData.price),
      images: imageUrls,
      model,
      stock: stockPerSize
    };
    onSave(finalData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {product ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {/* Sol Taraf - Ürün Bilgileri */}
          <Grid item xs={12} md={6}>
            <TextField
              label="Ürün Adı"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              fullWidth
              margin="dense"
            />
            <TextField
              label="Ürün Kodu (SKU)"
              name="sku"
              value={formData.sku || ''}
              onChange={handleChange}
              fullWidth
              margin="dense"
            />
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Fiyat"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  fullWidth
                  margin="dense"
                  inputProps={{ min: 0 }}
                />
              </Grid>
            </Grid>
            <FormControl fullWidth margin="dense">
              <InputLabel>Kategori</InputLabel>
              <Select
                name="category"
                value={formData.category || ''}
                onChange={handleChange}
                label="Kategori"
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.name}>{cat.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Marka"
              name="brand"
              value={formData.brand || ''}
              onChange={handleChange}
              fullWidth
              margin="dense"
            />
            <TextField
              label="Model"
              name="model"
              value={model}
              onChange={e => setModel(e.target.value)}
              fullWidth
              margin="dense"
            />
            <FormControl fullWidth margin="dense">
              <InputLabel>Cinsiyet</InputLabel>
              <Select
                name="gender"
                value={formData.gender || ''}
                onChange={handleChange}
                label="Cinsiyet"
              >
                <MenuItem value="Erkek">Erkek</MenuItem>
                <MenuItem value="Kadın">Kadın</MenuItem>
                <MenuItem value="Unisex">Unisex</MenuItem>
                <MenuItem value="Çocuk">Çocuk</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="dense">
              <InputLabel>Bedenler</InputLabel>
              <Select
                name="sizes"
                multiple
                value={formData.sizes || []}
                onChange={handleSizeChange}
                input={<OutlinedInput label="Bedenler" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
              >
                {[...Array(16)].map((_, i) => {
                  const size = 30 + i;
                  return (
                    <MenuItem key={size} value={size}>
                      {size}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            {/* Dinamik stok inputları */}
            {(formData.sizes || []).length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="subtitle2">Her Beden İçin Stok</Typography>
                <Grid container spacing={1}>
                  {formData.sizes.map(size => (
                    <Grid item xs={4} sm={3} md={2} key={size}>
                      <TextField
                        label={`Stok (${size})`}
                        type="number"
                        value={stockPerSize[size] || ''}
                        onChange={e => handleStockChange(size, Number(e.target.value))}
                        fullWidth
                        margin="dense"
                        inputProps={{ min: 0 }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
            <TextField
              label="Açıklama"
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              fullWidth
              multiline
              rows={4}
              margin="dense"
            />
          </Grid>
          
          {/* Sağ Taraf - Fotoğraf Yükleyici */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>Ürün Fotoğrafları</Typography>
            <Box
              {...getRootProps()}
              sx={{
                border: '2px dashed grey',
                p: 2,
                borderRadius: 2,
                textAlign: 'center',
                backgroundColor: isDragActive ? '#f0f0f0' : 'inherit',
                cursor: 'pointer'
              }}
            >
              <input {...getInputProps()} />
              <Button variant="outlined" component="span" startIcon={<AddPhotoIcon />}>
                Fotoğraf Seç veya Sürükleyip Bırak
              </Button>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                En fazla 15 adet. Sürükleyip bırakabilir veya tıklayarak seçebilirsiniz.
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
              {selectedImages.map((img, idx) => (
                <Box key={idx} sx={{ position: 'relative' }}>
                  <img
                    src={
                      typeof img === 'string'
                        ? img
                        : img instanceof File
                          ? URL.createObjectURL(img)
                          : '/no-image.png'
                    }
                    alt={`Ürün Fotoğrafı ${idx + 1}`}
                    width={100}
                    height={100}
                    style={{ objectFit: 'cover', borderRadius: 8 }}
                  />
                  <IconButton
                    size="small"
                    sx={{ position: 'absolute', top: 0, right: 0 }}
                    onClick={() => handleRemoveImage(idx)}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>İptal</Button>
        <Button onClick={handleSubmit} variant="contained">
          {product ? 'Güncelle' : 'Kaydet'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductFormModal; 