import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
    onAuthStateChanged, 
    signOut as firebaseSignOut, 
    GoogleAuthProvider, 
    signInWithPopup, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    updateProfile
} from 'firebase/auth';
import { auth } from '../firebase';
import { useRouter } from 'next/router';
import { userService } from '../services/firestoreService';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null); // Firestore'dan gelen ek kullanıcı verileri (rol vb.)
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false); // Hydration için
    const router = useRouter();

    // Hydration için mounted state'i
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        // Sadece istemci tarafında çalışsın
        if (!mounted) return;

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setLoading(true);
            if (user) {
                setUser(user);

                // Kullanıcı verisini Firestore'dan al
                try {
                    let userData = await userService.getUserById(user.uid);
                    
                    // Eğer kullanıcı Firestore'da yoksa oluştur
                    if (!userData) {
                        await userService.createUser(user.uid, {
                            email: user.email,
                            displayName: user.displayName || user.email,
                            role: 'user'
                        });
                        userData = await userService.getUserById(user.uid);
                    }
                    
                    console.log("[DEBUG] Firestore'dan gelen kullanıcı verisi:", userData);
                    setUserData(userData);
                } catch (error) {
                    console.error("Auth sync/fetch error:", error);
                    setUserData(null);
                }
            } else {
                setUser(null);
                setUserData(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [mounted]);

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            router.push('/');
        } catch (error) {
            console.error("Google ile giriş hatası", error);
            throw error;
        }
    };
    
    const registerWithEmail = async (email, password, displayName) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            // Firebase Auth profiline displayName'i ekle
            await updateProfile(userCredential.user, { displayName });
            // Geri kalanı onAuthStateChanged tetikleyecek ve senkronizasyonu yapacak.
            router.push('/');
        } catch (error) {
            console.error("E-posta ile kayıt hatası", error);
            throw error;
        }
    };

    const signInWithEmail = async (email, password) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push('/');
        } catch (error) {
            console.error("E-posta ile giriş hatası", error);
            throw error;
        }
    };

    const signOut = async () => {
        await firebaseSignOut(auth);
        setUserData(null); // userData'yı temizle
        router.push('/');
    };
    
    const value = {
        user,
        userData,
        loading: !mounted || loading, // Hydration sırasında loading true olsun
        signInWithGoogle,
        registerWithEmail,
        signInWithEmail,
        signOut,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}; 