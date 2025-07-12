import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Divider,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Store as StoreIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Payment as PaymentIcon,
  LocalShipping as ShippingIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  Backup as BackupIcon,
  Settings as SettingsIcon,
  ExpandMore as ExpandMoreIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuth } from '../../contexts/AuthContext';

const SettingCard = ({ title, description, icon, children }) => (
  <Card sx={{ 
    borderRadius: 3, 
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    transition: 'transform 0.2s ease-in-out',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
    }
  }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box sx={{ color: 'primary.main', mr: 2, fontSize: 32 }}>
          {icon}
        </Box>
        <Box>
          <Typography variant="h6" fontWeight={600}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Box>
      </Box>
      {children}
    </CardContent>
  </Card>
);

export default function SettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    // Site Ayarları
    siteName: 'STEP Golden Shoes',
    siteDescription: 'Şıklığın adımlarını at',
    contactEmail: 'info@stepshoes.com',
    contactPhone: '+90 212 555 0123',
    
    // E-ticaret Ayarları
    currency: 'TRY',
    taxRate: 20,
    freeShippingLimit: 500,
    
    // Bildirim Ayarları
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    lowStockAlert: true,
    newOrderAlert: true,
    
    // Güvenlik Ayarları
    twoFactorAuth: false,
    sessionTimeout: 30,
    strongPassword: true,
    
    // Ödeme Ayarları
    stripeEnabled: true,
    paypalEnabled: false,
    iyzicoEnabled: true,
    
    // Kargo Ayarları
    fastDelivery: true,
    sameDay: false,
    internationalShipping: false
  });

  const [editMode, setEditMode] = useState({});
  const [tempValues, setTempValues] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [backupDialog, setBackupDialog] = useState(false);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    showSnackbar('Ayar güncellendi', 'success');
  };

  const handleEditStart = (key) => {
    setEditMode(prev => ({ ...prev, [key]: true }));
    setTempValues(prev => ({ ...prev, [key]: settings[key] }));
  };

  const handleEditSave = (key) => {
    setSettings(prev => ({ ...prev, [key]: tempValues[key] }));
    setEditMode(prev => ({ ...prev, [key]: false }));
    showSnackbar('Değişiklik kaydedildi', 'success');
  };

  const handleEditCancel = (key) => {
    setEditMode(prev => ({ ...prev, [key]: false }));
    setTempValues(prev => ({ ...prev, [key]: settings[key] }));
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleBackup = () => {
    // Backup işlemi simülasyonu
    setTimeout(() => {
      setBackupDialog(false);
      showSnackbar('Yedekleme başarıyla tamamlandı', 'success');
    }, 2000);
  };

  return (
    <AdminLayout pageTitle="Sistem Ayarları">
      <Box>
        <Typography variant="h5" fontWeight={700} mb={4}>
          Site Yönetim Ayarları
        </Typography>

        <Grid container spacing={3}>
          {/* Site Genel Ayarları */}
          <Grid item xs={12} md={6}>
            <SettingCard
              title="Site Ayarları"
              description="Genel site bilgileri ve görünüm"
              icon={<StoreIcon />}
            >
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {editMode.siteName ? (
                    <>
                      <TextField
                        size="small"
                        value={tempValues.siteName}
                        onChange={(e) => setTempValues(prev => ({ ...prev, siteName: e.target.value }))}
                        sx={{ flex: 1, mr: 1 }}
                      />
                      <IconButton onClick={() => handleEditSave('siteName')} color="primary">
                        <SaveIcon />
                      </IconButton>
                      <IconButton onClick={() => handleEditCancel('siteName')}>
                        <CancelIcon />
                      </IconButton>
                    </>
                  ) : (
                    <>
                      <Typography sx={{ flex: 1 }}>
                        <strong>Site Adı:</strong> {settings.siteName}
                      </Typography>
                      <IconButton onClick={() => handleEditStart('siteName')}>
                        <EditIcon />
                      </IconButton>
                    </>
                  )}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {editMode.contactEmail ? (
                    <>
                      <TextField
                        size="small"
                        type="email"
                        value={tempValues.contactEmail}
                        onChange={(e) => setTempValues(prev => ({ ...prev, contactEmail: e.target.value }))}
                        sx={{ flex: 1, mr: 1 }}
                      />
                      <IconButton onClick={() => handleEditSave('contactEmail')} color="primary">
                        <SaveIcon />
                      </IconButton>
                      <IconButton onClick={() => handleEditCancel('contactEmail')}>
                        <CancelIcon />
                      </IconButton>
                    </>
                  ) : (
                    <>
                      <Typography sx={{ flex: 1 }}>
                        <strong>İletişim E-postası:</strong> {settings.contactEmail}
                      </Typography>
                      <IconButton onClick={() => handleEditStart('contactEmail')}>
                        <EditIcon />
                      </IconButton>
                    </>
                  )}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {editMode.contactPhone ? (
                    <>
                      <TextField
                        size="small"
                        value={tempValues.contactPhone}
                        onChange={(e) => setTempValues(prev => ({ ...prev, contactPhone: e.target.value }))}
                        sx={{ flex: 1, mr: 1 }}
                      />
                      <IconButton onClick={() => handleEditSave('contactPhone')} color="primary">
                        <SaveIcon />
                      </IconButton>
                      <IconButton onClick={() => handleEditCancel('contactPhone')}>
                        <CancelIcon />
                      </IconButton>
                    </>
                  ) : (
                    <>
                      <Typography sx={{ flex: 1 }}>
                        <strong>Telefon:</strong> {settings.contactPhone}
                      </Typography>
                      <IconButton onClick={() => handleEditStart('contactPhone')}>
                        <EditIcon />
                      </IconButton>
                    </>
                  )}
                </Box>
              </Box>
            </SettingCard>
          </Grid>

          {/* E-ticaret Ayarları */}
          <Grid item xs={12} md={6}>
            <SettingCard
              title="E-ticaret Ayarları"
              description="Satış ve ödeme konfigürasyonları"
              icon={<PaymentIcon />}
            >
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography sx={{ flex: 1 }}>
                    <strong>Para Birimi:</strong> {settings.currency}
                  </Typography>
                  <Chip label={settings.currency} color="primary" size="small" />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {editMode.taxRate ? (
                    <>
                      <TextField
                        size="small"
                        type="number"
                        value={tempValues.taxRate}
                        onChange={(e) => setTempValues(prev => ({ ...prev, taxRate: e.target.value }))}
                        sx={{ flex: 1, mr: 1 }}
                        InputProps={{ endAdornment: '%' }}
                      />
                      <IconButton onClick={() => handleEditSave('taxRate')} color="primary">
                        <SaveIcon />
                      </IconButton>
                      <IconButton onClick={() => handleEditCancel('taxRate')}>
                        <CancelIcon />
                      </IconButton>
                    </>
                  ) : (
                    <>
                      <Typography sx={{ flex: 1 }}>
                        <strong>KDV Oranı:</strong> %{settings.taxRate}
                      </Typography>
                      <IconButton onClick={() => handleEditStart('taxRate')}>
                        <EditIcon />
                      </IconButton>
                    </>
                  )}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {editMode.freeShippingLimit ? (
                    <>
                      <TextField
                        size="small"
                        type="number"
                        value={tempValues.freeShippingLimit}
                        onChange={(e) => setTempValues(prev => ({ ...prev, freeShippingLimit: e.target.value }))}
                        sx={{ flex: 1, mr: 1 }}
                        InputProps={{ endAdornment: '₺' }}
                      />
                      <IconButton onClick={() => handleEditSave('freeShippingLimit')} color="primary">
                        <SaveIcon />
                      </IconButton>
                      <IconButton onClick={() => handleEditCancel('freeShippingLimit')}>
                        <CancelIcon />
                      </IconButton>
                    </>
                  ) : (
                    <>
                      <Typography sx={{ flex: 1 }}>
                        <strong>Ücretsiz Kargo Limiti:</strong> {settings.freeShippingLimit}₺
                      </Typography>
                      <IconButton onClick={() => handleEditStart('freeShippingLimit')}>
                        <EditIcon />
                      </IconButton>
                    </>
                  )}
                </Box>
              </Box>
            </SettingCard>
          </Grid>

          {/* Bildirim Ayarları */}
          <Grid item xs={12} md={6}>
            <SettingCard
              title="Bildirim Ayarları"
              description="E-posta, SMS ve push bildirimleri"
              icon={<NotificationsIcon />}
            >
              <List dense>
                <ListItem>
                  <ListItemIcon><EmailIcon /></ListItemIcon>
                  <ListItemText primary="E-posta Bildirimleri" />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.emailNotifications}
                      onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemIcon><SmsIcon /></ListItemIcon>
                  <ListItemText primary="SMS Bildirimleri" />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.smsNotifications}
                      onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemIcon><NotificationsIcon /></ListItemIcon>
                  <ListItemText primary="Yeni Sipariş Uyarısı" />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.newOrderAlert}
                      onChange={(e) => handleSettingChange('newOrderAlert', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemIcon><StoreIcon /></ListItemIcon>
                  <ListItemText primary="Düşük Stok Uyarısı" />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.lowStockAlert}
                      onChange={(e) => handleSettingChange('lowStockAlert', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </SettingCard>
          </Grid>

          {/* Güvenlik Ayarları */}
          <Grid item xs={12} md={6}>
            <SettingCard
              title="Güvenlik Ayarları"
              description="Kimlik doğrulama ve güvenlik"
              icon={<SecurityIcon />}
            >
              <List dense>
                <ListItem>
                  <ListItemText primary="İki Faktörlü Kimlik Doğrulama" />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.twoFactorAuth}
                      onChange={(e) => handleSettingChange('twoFactorAuth', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText primary="Güçlü Şifre Zorunluluğu" />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.strongPassword}
                      onChange={(e) => handleSettingChange('strongPassword', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Oturum Zaman Aşımı" 
                    secondary={`${settings.sessionTimeout} dakika`}
                  />
                </ListItem>
              </List>
            </SettingCard>
          </Grid>

          {/* Kargo Ayarları */}
          <Grid item xs={12} md={6}>
            <SettingCard
              title="Kargo & Teslimat"
              description="Kargo seçenekleri ve ayarları"
              icon={<ShippingIcon />}
            >
              <List dense>
                <ListItem>
                  <ListItemText primary="Hızlı Teslimat" />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.fastDelivery}
                      onChange={(e) => handleSettingChange('fastDelivery', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText primary="Aynı Gün Teslimat" />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.sameDay}
                      onChange={(e) => handleSettingChange('sameDay', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText primary="Uluslararası Kargo" />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.internationalShipping}
                      onChange={(e) => handleSettingChange('internationalShipping', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </SettingCard>
          </Grid>

          {/* Yedekleme & Sistem */}
          <Grid item xs={12} md={6}>
            <SettingCard
              title="Yedekleme & Sistem"
              description="Veri yedekleme ve sistem işlemleri"
              icon={<BackupIcon />}
            >
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<BackupIcon />}
                  onClick={() => setBackupDialog(true)}
                  sx={{ mb: 2, mr: 2 }}
                >
                  Veritabanı Yedeği Al
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<SettingsIcon />}
                  sx={{ mb: 2 }}
                >
                  Sistem Logları
                </Button>
                <Alert severity="info" sx={{ mt: 2 }}>
                  Son yedekleme: 2 gün önce
                </Alert>
              </Box>
            </SettingCard>
          </Grid>
        </Grid>

        {/* Yedekleme Dialog */}
        <Dialog open={backupDialog} onClose={() => setBackupDialog(false)}>
          <DialogTitle>Veritabanı Yedekleme</DialogTitle>
          <DialogContent>
            <Typography>
              Tüm site verileri yedeklenecek. Bu işlem birkaç dakika sürebilir.
              Devam etmek istediğinizden emin misiniz?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setBackupDialog(false)}>İptal</Button>
            <Button variant="contained" onClick={handleBackup}>
              Yedekle
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
        </Snackbar>
      </Box>
    </AdminLayout>
  );
} 