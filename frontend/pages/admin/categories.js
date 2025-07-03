import React, { useState, useEffect } from 'react';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, CircularProgress, Alert } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuth } from '../../contexts/AuthContext';

const CategoriesPage = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, [user]);

  const fetchCategories = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const idToken = await user.getIdToken();
      const response = await fetch('http://localhost:5000/api/admin/categories', {
        headers: { 'Authorization': `Bearer ${idToken}` }
      });
      if (!response.ok) throw new Error('Kategoriler yüklenemedi.');
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setNewCategory({ name: '' });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveCategory = async () => {
    if (!newCategory.name) return;
    try {
      setSaving(true);
      const idToken = await user.getIdToken();
      const response = await fetch('http://localhost:5000/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ name: newCategory.name })
      });
      if (!response.ok) throw new Error('Kategori eklenemedi.');
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) return;
    try {
      const idToken = await user.getIdToken();
      const response = await fetch(`http://localhost:5000/api/admin/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${idToken}` }
      });
      if (!response.ok) throw new Error('Kategori silinemedi.');
      fetchCategories();
    } catch (err) {
      alert(err.message);
    }
  };

  const columns = [
    { field: 'name', headerName: 'Kategori Adı', flex: 1, minWidth: 200 },
    { field: 'createdAt', headerName: 'Oluşturma Tarihi', width: 180, valueGetter: (params) => params.row.createdAt?.seconds ? new Date(params.row.createdAt.seconds * 1000) : '', valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString('tr-TR') : '' },
    {
      field: 'actions',
      headerName: 'İşlemler',
      width: 150,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box>
          {/* <IconButton size="small" color="primary"><EditIcon /></IconButton> */}
          <IconButton size="small" color="error" onClick={() => handleDelete(params.row.id)}><DeleteIcon /></IconButton>
        </Box>
      ),
    },
  ];

  return (
    <AdminLayout pageTitle="Kategoriler">
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenModal}>
          Yeni Kategori Ekle
        </Button>
      </Box>
      {error && <Alert severity="error">{error}</Alert>}
      <Box sx={{ height: 650, width: '100%', backgroundColor: '#fff', borderRadius: 2 }}>
        <DataGrid
          rows={categories}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          checkboxSelection
          disableSelectionOnClick
          components={{ Toolbar: GridToolbar }}
          getRowId={(row) => row.id}
          loading={loading}
        />
      </Box>
      <Dialog open={isModalOpen} onClose={handleCloseModal}>
        <DialogTitle>Yeni Kategori Ekle</DialogTitle>
        <DialogContent>
          <TextField
            label="Kategori Adı"
            value={newCategory.name}
            onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
            fullWidth
            margin="dense"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>İptal</Button>
          <Button onClick={handleSaveCategory} variant="contained" disabled={saving}>
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
};

export default CategoriesPage; 