import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const firebaseConfig = {
  // ... mevcut config ...
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup, signOut };
