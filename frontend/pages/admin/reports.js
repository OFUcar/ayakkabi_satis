import AdminLayout from '../../components/admin/AdminLayout';
import { Box, Typography } from '@mui/material';

export default function ReportsPage() {
  return (
    <AdminLayout pageTitle="Raporlar">
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography variant="h4" fontWeight={700} color="text.secondary" align="center">
          Geri dönüşlere uygun olarak dizayn edilecektir
        </Typography>
      </Box>
    </AdminLayout>
  );
} 