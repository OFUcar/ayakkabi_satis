import React, { useState, useEffect } from 'react';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, CircularProgress, Alert } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuth } from '../../contexts/AuthContext';
import { getDocs, collection, addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";

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
    try {
      setLoading(true);
      setError(null);
      const categoriesSnap = await getDocs(collection(db, "categories"));
      setCategories(categoriesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      setError('Kategoriler yüklenemedi.');
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
      await addDoc(collection(db, "categories"), {
        name: newCategory.name,
        createdAt: serverTimestamp()
      });
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      alert('Kategori eklenemedi.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) return;
    try {
      await deleteDoc(doc(db, "categories", id));
      fetchCategories();
    } catch (err) {
      alert('Kategori silinemedi.');
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
      <Box sx={{ 
        height: 650, 
        width: '100%', 
        backgroundColor: '#fff', 
        borderRadius: 2,
        '& .MuiDataGrid-root': {
          border: '1px solid #e0e0e0',
          '& .MuiDataGrid-cell': {
            color: '#333',
            borderBottom: '1px solid #f0f0f0',
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#f8f9fa',
            color: '#333',
            fontWeight: 600,
            borderBottom: '2px solid #e0e0e0',
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            color: '#333',
            fontWeight: 600,
          },
          '& .MuiDataGrid-row': {
            '&:hover': {
              backgroundColor: '#f5f5f5',
            },
            '&.Mui-selected': {
              backgroundColor: '#e3f2fd',
              '&:hover': {
                backgroundColor: '#bbdefb',
              },
            },
          },
          '& .MuiDataGrid-footerContainer': {
            backgroundColor: '#f8f9fa',
            borderTop: '2px solid #e0e0e0',
            color: '#333',
          },
          '& .MuiTablePagination-root': {
            color: '#333',
          },
          '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
            color: '#333',
          },
          '& .MuiDataGrid-toolbarContainer': {
            backgroundColor: '#f8f9fa',
            borderBottom: '1px solid #e0e0e0',
            padding: '8px 16px',
            '& .MuiButton-root': {
              color: '#333',
            },
            '& .MuiFormControl-root': {
              '& .MuiInputLabel-root': {
                color: '#666',
              },
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#e0e0e0',
                },
                '&:hover fieldset': {
                  borderColor: '#333',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#1976d2',
                },
                '& input': {
                  color: '#333',
                },
              },
            },
          },
        },
      }}>
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