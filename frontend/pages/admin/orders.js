import React, { useState, useEffect } from 'react';
import { Box, Typography, Chip, CircularProgress, Alert, IconButton } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Visibility as VisibilityIcon } from '@mui/icons-material';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';
import { getDocs, collection } from "firebase/firestore";
import { db } from "../../firebase";

const getStatusChipProps = (status) => {
  switch (status) {
    case 'pending':
      return { label: 'Beklemede', color: 'warning' };
    case 'shipped':
      return { label: 'Kargolandı', color: 'info' };
    case 'completed':
      return { label: 'Teslim Edildi', color: 'success' };
    case 'cancelled':
      return { label: 'İptal Edildi', color: 'error' };
    default:
      return { label: status, color: 'default' };
  }
};

const OrdersPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const ordersSnap = await getDocs(collection(db, "orders"));
      setOrders(ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      setError('Siparişler yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (id) => {
    // router.push(`/admin/orders/${id}`);
    console.log(`Viewing order ${id}`);
  };

  const columns = [
    { field: 'id', headerName: 'Sipariş ID', width: 200 },
    { field: 'customerName', headerName: 'Müşteri', flex: 1, minWidth: 180 },
    {
      field: 'date',
      headerName: 'Tarih',
      width: 150,
      type: 'date',
      valueGetter: (params) => new Date(params.value),
      valueFormatter: (params) => new Date(params.value).toLocaleDateString('tr-TR'),
    },
    {
      field: 'total',
      headerName: 'Toplam Tutar',
      width: 150,
      // Hata veren satırı düzeltiyoruz:
      valueFormatter: (params) => `₺${(params.value || 0).toFixed(2)}`,
    },
    { field: 'itemCount', headerName: 'Ürün Sayısı', width: 120 },
    {
      field: 'status',
      headerName: 'Durum',
      width: 150,
      renderCell: (params) => {
        const { label, color } = getStatusChipProps(params.value);
        return <Chip label={label} color={color} size="small" />;
      },
    },
    {
      field: 'actions',
      headerName: 'İşlemler',
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <IconButton onClick={() => handleViewOrder(params.id)} color="primary">
          <VisibilityIcon />
        </IconButton>
      ),
    },
  ];

  if (loading) {
    return <AdminLayout pageTitle="Siparişler"><CircularProgress /></AdminLayout>;
  }

  if (error) {
    return <AdminLayout pageTitle="Siparişler"><Alert severity="error">{error}</Alert></AdminLayout>;
  }

  return (
    <AdminLayout pageTitle="Siparişler">
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
          rows={orders}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          components={{ Toolbar: GridToolbar }}
          getRowId={(row) => row.id}
          initialState={{
            sorting: {
              sortModel: [{ field: 'date', sort: 'desc' }],
            },
          }}
        />
      </Box>
    </AdminLayout>
  );
};

export default OrdersPage; 