import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Container,
  Paper,
  Grid,
  TextField,
  Button,
  Avatar,
} from '@mui/material';
import {
  Person as PersonIcon,
  Lock as LockIcon,
  LocationOn as LocationIcon,
  ShoppingBag as ShoppingBagIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`account-tabpanel-${index}`}
      aria-labelledby={`account-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ProfileTab = ({ user }) => (
  <Grid container spacing={3}>
    <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
      <Avatar
        sx={{ width: 120, height: 120, mb: 2, mx: 'auto' }}
        src={user?.photoURL}
      >
        <PersonIcon sx={{ fontSize: 60 }} />
      </Avatar>
      <Button variant="outlined" component="label">
        Resmi Değiştir
        <input type="file" hidden />
      </Button>
    </Grid>
    <Grid item xs={12} md={8}>
      <TextField
        fullWidth
        label="Ad Soyad"
        defaultValue={user?.displayName || ''}
        margin="normal"
      />
      <TextField
        fullWidth
        label="E-posta Adresi"
        defaultValue={user?.email || ''}
        margin="normal"
        disabled
      />
      <TextField
        fullWidth
        label="Telefon Numarası"
        placeholder="Telefon numaranızı ekleyin"
        margin="normal"
      />
      <Button variant="contained" sx={{ mt: 2 }}>
        Bilgileri Güncelle
      </Button>
    </Grid>
  </Grid>
);

const SecurityTab = () => (
    <Box>
        <Typography variant="h6" gutterBottom>Şifre Değiştir</Typography>
        <TextField fullWidth label="Mevcut Şifre" type="password" margin="normal" />
        <TextField fullWidth label="Yeni Şifre" type="password" margin="normal" />
        <TextField fullWidth label="Yeni Şifre (Tekrar)" type="password" margin="normal" />
        <Button variant="contained" sx={{ mt: 2 }}>Şifreyi Değiştir</Button>
    </Box>
);

const OrdersTab = () => (
    <Box>
        <Typography variant="h6" gutterBottom>Siparişlerim</Typography>
        {/* Buraya sipariş listesi gelecek */}
        <Typography>Geçmiş siparişleriniz burada listelenecek.</Typography>
    </Box>
);

const AccountPage = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      <Typography variant="h4" gutterBottom>Hesabım</Typography>
      <Paper sx={{ display: 'flex', minHeight: '60vh', borderRadius: 2 }}>
        <Tabs
          orientation="vertical"
          variant="scrollable"
          value={tabValue}
          onChange={handleTabChange}
          sx={{ borderRight: 1, borderColor: 'divider', minWidth: 200 }}
        >
          <Tab icon={<PersonIcon />} iconPosition="start" label="Profil" />
          <Tab icon={<LockIcon />} iconPosition="start" label="Güvenlik" />
          <Tab icon={<ShoppingBagIcon />} iconPosition="start" label="Siparişlerim" />
        </Tabs>
        <Box sx={{ flexGrow: 1 }}>
          <TabPanel value={tabValue} index={0}>
            <ProfileTab user={user} />
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <SecurityTab />
          </TabPanel>
          <TabPanel value={tabValue} index={2}>
            <OrdersTab />
          </TabPanel>
        </Box>
      </Paper>
    </Container>
  );
};

export default AccountPage; 