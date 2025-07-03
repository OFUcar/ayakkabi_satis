import React, { useState, useEffect } from 'react';
import { Box, Typography, Chip, CircularProgress, Alert, IconButton } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Visibility as VisibilityIcon } from '@mui/icons-material';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';

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
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const idToken = await user.getIdToken();
      // Tüm siparişleri getirmek için yeni bir endpoint varsayıyoruz
      const response = await fetch('http://localhost:5000/api/admin/orders', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      if (!response.ok) {
        throw new Error('Siparişler yüklenemedi.');
      }
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      setError(err.message);
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
      <Box sx={{ height: 650, width: '100%', backgroundColor: '#fff', borderRadius: 2 }}>
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