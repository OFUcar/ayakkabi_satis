import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Chip,
  Alert,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid
} from '@mui/material';
import {
  Warning as WarningIcon,
  Inventory as InventoryIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { getDocs, collection, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";

const StockAlerts = ({ onStockUpdate }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restockDialogOpen, setRestockDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [restockQuantity, setRestockQuantity] = useState({});

  useEffect(() => {
    fetchStockAlerts();
  }, []);

  const fetchStockAlerts = async () => {
    try {
      setLoading(true);
      const productsSnap = await getDocs(collection(db, "products"));
      const products = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const lowStockProducts = [];
      
      products.forEach(product => {
        if (product.stock && typeof product.stock === 'object') {
          Object.entries(product.stock).forEach(([size, quantity]) => {
            if (quantity <= 5 && quantity > 0) {
              lowStockProducts.push({
                id: product.id,
                name: product.name,
                size,
                quantity,
                category: product.category,
                price: product.price,
                type: 'low_stock',
                severity: quantity <= 2 ? 'error' : 'warning'
              });
            } else if (quantity === 0) {
              lowStockProducts.push({
                id: product.id,
                name: product.name,
                size,
                quantity,
                category: product.category,
                price: product.price,
                type: 'out_of_stock',
                severity: 'error'
              });
            }
          });
        }
      });

      setAlerts(lowStockProducts);
    } catch (error) {
      console.error('Stok uyarıları alınırken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestock = (product) => {
    setSelectedProduct(product);
    setRestockQuantity({ [product.size]: '' });
    setRestockDialogOpen(true);
  };

  const handleRestockSave = async () => {
    if (!selectedProduct || !restockQuantity[selectedProduct.size]) return;

    try {
      const productRef = doc(db, "products", selectedProduct.id);
      const newQuantity = parseInt(restockQuantity[selectedProduct.size]);
      
      // Mevcut stock objesini güncelle
      const updatedStock = { 
        ...selectedProduct.stock, 
        [selectedProduct.size]: newQuantity 
      };

      await updateDoc(productRef, { stock: updatedStock });
      
      setRestockDialogOpen(false);
      setSelectedProduct(null);
      setRestockQuantity({});
      fetchStockAlerts();
      
      if (onStockUpdate) {
        onStockUpdate();
      }
    } catch (error) {
      console.error('Stok güncellenirken hata:', error);
    }
  };

  const getAlertIcon = (type) => {
    return type === 'out_of_stock' ? 
      <WarningIcon color="error" /> : 
      <InventoryIcon color="warning" />;
  };

  const getAlertMessage = (alert) => {
    if (alert.type === 'out_of_stock') {
      return `${alert.name} (${alert.size} numara) - Stok tükendi!`;
    }
    return `${alert.name} (${alert.size} numara) - Düşük stok: ${alert.quantity} adet`;
  };

  if (loading) return null;

  if (alerts.length === 0) {
    return (
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <NotificationsIcon sx={{ mr: 1, color: 'success.main' }} />
          <Typography variant="h6" fontWeight={600}>
            Stok Durumu
          </Typography>
        </Box>
        <Alert severity="success">
          Tüm ürünler yeterli stokta!
        </Alert>
      </Paper>
    );
  }

  return (
    <>
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center">
            <WarningIcon sx={{ mr: 1, color: 'warning.main' }} />
            <Typography variant="h6" fontWeight={600}>
              Stok Uyarıları
            </Typography>
            <Chip 
              label={alerts.length} 
              color="warning" 
              size="small" 
              sx={{ ml: 1 }}
            />
          </Box>
        </Box>

        <List>
          {alerts.slice(0, 5).map((alert, index) => (
            <React.Fragment key={`${alert.id}-${alert.size}`}>
              <ListItem>
                <ListItemIcon>
                  {getAlertIcon(alert.type)}
                </ListItemIcon>
                <ListItemText
                  primary={getAlertMessage(alert)}
                  secondary={`Kategori: ${alert.category} • Fiyat: ${alert.price}₺`}
                />
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => handleRestock(alert)}
                  sx={{ ml: 1 }}
                >
                  Stok Ekle
                </Button>
              </ListItem>
              {index < alerts.slice(0, 5).length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>

        {alerts.length > 5 && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              +{alerts.length - 5} daha fazla uyarı var
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Stok Ekleme Dialog */}
      <Dialog open={restockDialogOpen} onClose={() => setRestockDialogOpen(false)}>
        <DialogTitle>
          Stok Ekle - {selectedProduct?.name}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Beden: {selectedProduct?.size} • Mevcut Stok: {selectedProduct?.quantity} adet
          </Typography>
          <TextField
            label="Yeni Stok Miktarı"
            type="number"
            value={restockQuantity[selectedProduct?.size] || ''}
            onChange={(e) => setRestockQuantity({
              [selectedProduct?.size]: e.target.value
            })}
            fullWidth
            inputProps={{ min: 0 }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestockDialogOpen(false)}>
            İptal
          </Button>
          <Button 
            variant="contained" 
            onClick={handleRestockSave}
            disabled={!restockQuantity[selectedProduct?.size]}
          >
            Stok Güncelle
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default StockAlerts; 