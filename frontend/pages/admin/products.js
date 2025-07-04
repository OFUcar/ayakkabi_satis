import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Avatar, CircularProgress, Alert, IconButton, Switch, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import AdminLayout from '../../components/admin/AdminLayout';
import ProductFormModal from '../../components/admin/ProductFormModal';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';
import { getDocs, collection, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";

const ProductsPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [discountModalOpen, setDiscountModalOpen] = useState(false);
  const [discountValue, setDiscountValue] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [discountLoading, setDiscountLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [user]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const productsSnap = await getDocs(collection(db, "products"));
      setProducts(productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      setError('Ürünler yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
      try {
        await deleteDoc(doc(db, "products", id));
        fetchProducts();
      } catch (err) {
        alert('Ürün silinemedi.');
      }
    }
  };
  
  const handleEdit = (id) => {
    const productToEdit = products.find(p => p.id === id);
    setEditingProduct(productToEdit);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };
  
  const handleSaveProduct = async (productData) => {
    try {
      if (productData.id) {
        const { id, ...updateData } = productData;
        await updateDoc(doc(db, "products", id), updateData);
      } else {
        await addDoc(collection(db, "products"), productData);
      }
      fetchProducts();
      handleCloseModal();
    } catch (err) {
      alert('Ürün kaydedilemedi.');
    }
  };

  const columns = [
    { 
      field: 'images',
      headerName: 'Görsel',
      width: 80,
      renderCell: (params) => (
        params.value && params.value.length > 0
          ? <Avatar src={params.value[0]} variant="rounded" />
          : null
      ),
      sortable: false,
      filterable: false,
    },
    { field: 'name', headerName: 'Ürün Adı', flex: 1, minWidth: 200 },
    { field: 'category', headerName: 'Kategori', width: 150 },
    { 
      field: 'price', 
      headerName: 'Fiyat', 
      width: 120,
      valueFormatter: (params) => `₺${(Number(params.value) || 0).toFixed(2)}`,
    },
    {
      field: 'stock',
      headerName: 'Stok',
      width: 120,
      valueGetter: (params) => {
        const stock = params.row.stock;
        if (!stock) return '';
        if (typeof stock === 'object') {
          // Bedenlere göre stokları özetle
          return Object.entries(stock).map(([beden, adet]) => `${beden}: ${adet}`).join(', ');
        }
        return stock;
      }
    },
    {
      field: 'status',
      headerName: 'Durum',
      width: 160,
      renderCell: (params) => {
        const stock = params.row.stock;
        let totalStock = 0;
        if (typeof stock === 'object' && stock !== null) {
          totalStock = Object.values(stock).reduce((sum, adet) => sum + Number(adet), 0);
        } else if (typeof stock === 'number') {
          totalStock = stock;
        }
        const isActive = params.row.isActive !== false; // undefined veya true ise aktif
        const status = (totalStock > 0 && isActive) ? 'Yayında' : 'Yayında Değil';
        return (
          <Box display="flex" alignItems="center" gap={1}>
            <Switch
              checked={isActive}
              color="success"
              size="small"
              onChange={async (e) => {
                const newActive = e.target.checked;
                try {
                  await updateDoc(doc(db, "products", params.id), { isActive: newActive });
                  setProducts(products => products.map(p => p.id === params.id ? { ...p, isActive: newActive } : p));
                } catch (err) {
                  alert('Durum güncellenemedi: ' + err.message);
                }
              }}
            />
            <Typography
              sx={{
                color: status === 'Yayında' ? 'success.main' : 'error.main',
                fontWeight: '600',
                fontSize: 14
              }}
            >
              {status}
            </Typography>
          </Box>
        );
      }
    },
    {
      field: 'actions',
      headerName: 'İşlemler',
      width: 150,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box>
          <IconButton onClick={() => handleEdit(params.id)} size="small" color="primary">
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => handleDelete(params.id)} size="small" color="error">
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  if (loading) {
    return (
      <AdminLayout pageTitle="Ürünler">
        <Box display="flex" justifyContent="center" alignItems="center" sx={{ height: 400 }}>
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout pageTitle="Ürünler">
        <Alert severity="error">{error}</Alert>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle="Ürünler">
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddNew}>
          Yeni Ürün Ekle
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          disabled={selectedIds.length === 0}
          onClick={() => setDiscountModalOpen(true)}
        >
          İndirim
        </Button>
      </Box>
      <Box sx={{ height: 650, width: '100%', backgroundColor: '#fff', borderRadius: 2 }}>
        <DataGrid
          rows={products}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          checkboxSelection
          disableSelectionOnClick
          components={{ Toolbar: GridToolbar }}
          getRowId={(row) => row.id}
          rowSelectionModel={selectedIds}
          onRowSelectionModelChange={(ids) => setSelectedIds(ids)}
        />
      </Box>
      
      <ProductFormModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveProduct}
        product={editingProduct}
      />

      <Dialog open={discountModalOpen} onClose={() => setDiscountModalOpen(false)}>
        <DialogTitle>İndirim Uygula</DialogTitle>
        <DialogContent>
          <TextField
            label="İndirim Oranı (%)"
            type="number"
            value={discountValue}
            onChange={e => setDiscountValue(e.target.value.replace(/[^0-9.]/g, ''))}
            fullWidth
            inputProps={{ min: 1, max: 99 }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDiscountModalOpen(false)}>İptal</Button>
          <Button
            variant="contained"
            color="primary"
            disabled={!discountValue || isNaN(Number(discountValue)) || Number(discountValue) <= 0 || Number(discountValue) >= 100 || discountLoading}
            onClick={async () => {
              setDiscountLoading(true);
              try {
                const idToken = await user.getIdToken();
                for (const id of selectedIds) {
                  const product = products.find(p => p.id === id);
                  if (!product) continue;
                  const discount = Number(discountValue);
                  const newPrice = Number(product.price) * (1 - discount / 100);
                  await updateDoc(doc(db, "products", id), {
                    discount,
                    price: Number(newPrice.toFixed(2))
                  });
                }
                setDiscountModalOpen(false);
                setDiscountValue('');
                fetchProducts();
              } catch (err) {
                alert('İndirim uygulanamadı: ' + err.message);
              } finally {
                setDiscountLoading(false);
              }
            }}
          >
            Uygula
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
};

export default ProductsPage; 