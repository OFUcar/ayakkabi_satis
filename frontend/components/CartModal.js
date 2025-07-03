import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  Card,
  CardMedia,
  CardContent,
  Grid,
  Divider,
  Chip,
  TextField
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  ShoppingCart as CartIcon
} from '@mui/icons-material';
import { useCart } from '../contexts/CartContext';
import styles from '../styles/CartModal.module.css';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';

const CartModal = ({ open, onClose }) => {
  const { items, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const handleQuantityChange = (productId, newQuantity) => {
    updateQuantity(productId, newQuantity);
  };

  const handleCheckout = () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    // Ödeme sayfasına yönlendirme
    console.log('Ödeme sayfasına yönlendiriliyor...');
    onClose();
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        className: styles.dialog
      }}
    >
      <DialogTitle className={styles.dialogTitle}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <CartIcon className={styles.cartIcon} />
            <Typography variant="h6" fontWeight={600}>
              Sepetim ({items.length} ürün)
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent className={styles.dialogContent}>
        {items.length === 0 ? (
          <Box className={styles.emptyCart}>
            <CartIcon className={styles.emptyCartIcon} />
            <Typography variant="h6" color="textSecondary" gutterBottom>
              Sepetiniz boş
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Alışverişe başlamak için ürünlerimize göz atın
            </Typography>
          </Box>
        ) : (
          <Box>
            {items.map((item) => (
              <Card key={item.id} className={styles.cartItem}>
                <Grid container spacing={2}>
                  <Grid item xs={3} sm={2}>
                    <CardMedia
                      component="img"
                      image={item.images && item.images.length > 0 ? item.images[0] : item.image}
                      alt={item.name}
                      className={styles.itemImage}
                    />
                  </Grid>
                  <Grid item xs={9} sm={7}>
                    <CardContent className={styles.itemContent}>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        {item.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        {item.description}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Chip
                          label={item.category}
                          size="small"
                          className={styles.categoryChip}
                        />
                      </Box>
                      <Typography variant="h6" color="primary" fontWeight={600}>
                        {formatPrice(item.price)}
                      </Typography>
                    </CardContent>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Box className={styles.quantitySection}>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Adet
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <IconButton
                          size="small"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className={styles.quantityButton}
                        >
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                        <TextField
                          value={item.quantity}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0;
                            handleQuantityChange(item.id, value);
                          }}
                          size="small"
                          className={styles.quantityInput}
                          inputProps={{
                            min: 1,
                            style: { textAlign: 'center' }
                          }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className={styles.quantityButton}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      <Typography variant="body2" color="textSecondary" mt={1}>
                        Toplam: {formatPrice(item.price * item.quantity)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
                <IconButton
                  onClick={() => removeFromCart(item.id)}
                  className={styles.deleteButton}
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              </Card>
            ))}

            <Divider className={styles.divider} />

            <Box className={styles.summary}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" fontWeight={600}>
                  Toplam Tutar:
                </Typography>
                <Typography variant="h5" color="primary" fontWeight={700}>
                  {formatPrice(getCartTotal())}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </DialogContent>

      {items.length > 0 && (
        <DialogActions className={styles.dialogActions}>
          <Button
            onClick={clearCart}
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
          >
            Sepeti Temizle
          </Button>
          <Button
            onClick={handleCheckout}
            variant="contained"
            color="primary"
            size="large"
            className={styles.checkoutButton}
          >
            Ödemeye Geç ({formatPrice(getCartTotal())})
          </Button>
        </DialogActions>
      )}
      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </Dialog>
  );
};

export default CartModal; 