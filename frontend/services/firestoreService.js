import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';

// Ürün servisleri
export const productService = {
  // Tüm ürünleri getir
  async getAllProducts() {
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Ürünler getirilemedi:', error);
      return [];
    }
  },

  // Ürün detayını getir
  async getProductById(id) {
    try {
      const docRef = doc(db, 'products', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Ürün detayı getirilemedi:', error);
      return null;
    }
  },

  // Ürün ekle (Admin)
  async addProduct(productData) {
    try {
      const docRef = await addDoc(collection(db, 'products'), {
        ...productData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { id: docRef.id, ...productData };
    } catch (error) {
      console.error('Ürün eklenemedi:', error);
      throw error;
    }
  },

  // Ürün güncelle (Admin)
  async updateProduct(id, productData) {
    try {
      const docRef = doc(db, 'products', id);
      await updateDoc(docRef, {
        ...productData,
        updatedAt: serverTimestamp()
      });
      return { id, ...productData };
    } catch (error) {
      console.error('Ürün güncellenemedi:', error);
      throw error;
    }
  },

  // Ürün sil (Admin)
  async deleteProduct(id) {
    try {
      await deleteDoc(doc(db, 'products', id));
      return true;
    } catch (error) {
      console.error('Ürün silinemedi:', error);
      throw error;
    }
  }
};

// Kategori servisleri
export const categoryService = {
  async getAllCategories() {
    try {
      const querySnapshot = await getDocs(collection(db, 'categories'));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Kategoriler getirilemedi:', error);
      return [];
    }
  },

  async addCategory(categoryData) {
    try {
      const docRef = await addDoc(collection(db, 'categories'), {
        ...categoryData,
        createdAt: serverTimestamp()
      });
      return { id: docRef.id, ...categoryData };
    } catch (error) {
      console.error('Kategori eklenemedi:', error);
      throw error;
    }
  },

  async deleteCategory(id) {
    try {
      await deleteDoc(doc(db, 'categories', id));
      return true;
    } catch (error) {
      console.error('Kategori silinemedi:', error);
      throw error;
    }
  }
};

// Kullanıcı servisleri
export const userService = {
  async getUserById(uid) {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Kullanıcı getirilemedi:', error);
      return null;
    }
  },

  async createUser(uid, userData) {
    try {
      await updateDoc(doc(db, 'users', uid), {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { id: uid, ...userData };
    } catch (error) {
      console.error('Kullanıcı oluşturulamadı:', error);
      throw error;
    }
  },

  async updateUser(uid, userData) {
    try {
      await updateDoc(doc(db, 'users', uid), {
        ...userData,
        updatedAt: serverTimestamp()
      });
      return { id: uid, ...userData };
    } catch (error) {
      console.error('Kullanıcı güncellenemedi:', error);
      throw error;
    }
  },

  async getAllUsers() {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Kullanıcılar getirilemedi:', error);
      return [];
    }
  }
};

// Sipariş servisleri
export const orderService = {
  async createOrder(orderData) {
    try {
      const docRef = await addDoc(collection(db, 'orders'), {
        ...orderData,
        createdAt: serverTimestamp(),
        status: 'pending'
      });
      return { id: docRef.id, ...orderData };
    } catch (error) {
      console.error('Sipariş oluşturulamadı:', error);
      throw error;
    }
  },

  async getUserOrders(userId) {
    try {
      const q = query(
        collection(db, 'orders'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Kullanıcı siparişleri getirilemedi:', error);
      return [];
    }
  },

  async getAllOrders() {
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Tüm siparişler getirilemedi:', error);
      return [];
    }
  },

  async updateOrderStatus(orderId, status) {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Sipariş durumu güncellenemedi:', error);
      throw error;
    }
  }
};

// Adres servisleri
export const addressService = {
  async getUserAddresses(userId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return userDoc.data().addresses || [];
      }
      return [];
    } catch (error) {
      console.error('Kullanıcı adresleri getirilemedi:', error);
      return [];
    }
  },

  async addAddress(userId, addressData) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('Kullanıcı bulunamadı');
      }

      const addresses = userDoc.data().addresses || [];
      const newAddress = {
        id: Date.now().toString(),
        ...addressData,
        createdAt: new Date()
      };

      await updateDoc(userRef, {
        addresses: [...addresses, newAddress],
        updatedAt: serverTimestamp()
      });

      return newAddress;
    } catch (error) {
      console.error('Adres eklenemedi:', error);
      throw error;
    }
  },

  async updateAddress(userId, addressId, addressData) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('Kullanıcı bulunamadı');
      }

      const addresses = userDoc.data().addresses || [];
      const addressIndex = addresses.findIndex(addr => addr.id === addressId);
      
      if (addressIndex === -1) {
        throw new Error('Adres bulunamadı');
      }

      addresses[addressIndex] = {
        ...addresses[addressIndex],
        ...addressData,
        updatedAt: new Date()
      };

      await updateDoc(userRef, {
        addresses,
        updatedAt: serverTimestamp()
      });

      return addresses[addressIndex];
    } catch (error) {
      console.error('Adres güncellenemedi:', error);
      throw error;
    }
  },

  async deleteAddress(userId, addressId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('Kullanıcı bulunamadı');
      }

      const addresses = userDoc.data().addresses || [];
      const filteredAddresses = addresses.filter(addr => addr.id !== addressId);

      await updateDoc(userRef, {
        addresses: filteredAddresses,
        updatedAt: serverTimestamp()
      });

      return true;
    } catch (error) {
      console.error('Adres silinemedi:', error);
      throw error;
    }
  }
}; 