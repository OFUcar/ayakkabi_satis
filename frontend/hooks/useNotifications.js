import { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  limit, 
  doc, 
  updateDoc, 
  addDoc, 
  writeBatch 
} from 'firebase/firestore';
import { db } from '../firebase';

export const useNotifications = (userId, isAdmin = false) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    // Notification audio setup
    audioRef.current = new Audio('/sounds/notification.mp3');
    audioRef.current.volume = 0.3;

    let unsubscribe;

    if (isAdmin) {
      // Admin için sistem bildirimleri
      const q = query(
        collection(db, 'notifications'),
        where('type', 'in', ['order', 'stock', 'system']),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      unsubscribe = onSnapshot(q, (snapshot) => {
        const newNotifications = [];
        snapshot.docs.forEach(doc => {
          newNotifications.push({ id: doc.id, ...doc.data() });
        });

        // Yeni bildirim kontrolü
        if (notifications.length > 0 && newNotifications.length > notifications.length) {
          playNotificationSound();
          showBrowserNotification(newNotifications[0]);
        }

        setNotifications(newNotifications);
        setUnreadCount(newNotifications.filter(n => !n.read).length);
        setLoading(false);
      });
    } else {
      // Normal kullanıcı için kişisel bildirimler
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(20)
      );

      unsubscribe = onSnapshot(q, (snapshot) => {
        const newNotifications = [];
        snapshot.docs.forEach(doc => {
          newNotifications.push({ id: doc.id, ...doc.data() });
        });

        setNotifications(newNotifications);
        setUnreadCount(newNotifications.filter(n => !n.read).length);
        setLoading(false);
      });
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [userId, isAdmin]);

  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(console.error);
    }
  };

  const showBrowserNotification = (notification) => {
    if (!("Notification" in window)) return;

    if (Notification.permission === "granted") {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/favicon.ico'
          });
        }
      });
    }
  };

  const markAsRead = async (notificationId) => {
    // Firebase'de read: true yap
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, { read: true });
    } catch (error) {
      console.error('Bildirim okundu işaretlenirken hata:', error);
    }
  };

  const markAllAsRead = async () => {
    // Tüm bildirimleri okundu işaretle
    try {
      const batch = writeBatch(db);
      notifications.forEach(notification => {
        if (!notification.read) {
          const notificationRef = doc(db, 'notifications', notification.id);
          batch.update(notificationRef, { read: true });
        }
      });
      await batch.commit();
    } catch (error) {
      console.error('Tüm bildirimler okundu işaretlenirken hata:', error);
    }
  };

  const createNotification = async (notificationData) => {
    try {
      await addDoc(collection(db, 'notifications'), {
        ...notificationData,
        createdAt: new Date(),
        read: false,
        id: Date.now().toString()
      });
    } catch (error) {
      console.error('Bildirim oluşturulurken hata:', error);
    }
  };

  // Admin için sistem bildirimleri oluşturma fonksiyonları
  const createStockAlert = async (product, size, quantity) => {
    if (!isAdmin) return;
    
    await createNotification({
      type: 'stock',
      title: 'Düşük Stok Uyarısı',
      message: `${product.name} (${size} numara) - Kalan stok: ${quantity}`,
      priority: quantity === 0 ? 'high' : 'medium',
      productId: product.id,
      data: { product, size, quantity }
    });
  };

  const createOrderAlert = async (order) => {
    if (!isAdmin) return;
    
    await createNotification({
      type: 'order',
      title: 'Yeni Sipariş',
      message: `Yeni sipariş alındı - Tutar: ${order.total}₺`,
      priority: 'medium',
      orderId: order.id,
      data: { order }
    });
  };

  const createSystemAlert = async (message, priority = 'low') => {
    if (!isAdmin) return;
    
    await createNotification({
      type: 'system',
      title: 'Sistem Bildirimi',
      message,
      priority,
      data: {}
    });
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    createStockAlert,
    createOrderAlert,
    createSystemAlert,
    playNotificationSound
  };
};

export default useNotifications; 