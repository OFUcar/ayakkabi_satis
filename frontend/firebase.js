import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut
} from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDpSNcoZbtShFO4OGsPb2tT3danDmZlI2k",
  authDomain: "ayakkabi-satis-07.firebaseapp.com",
  projectId: "ayakkabi-satis-07",
  storageBucket: "ayakkabi-satis-07.appspot.com",
  messagingSenderId: "1009213623238",
  appId: "1:1009213623238:web:5fbf99989376c9dc5a00c7",
  measurementId: "G-JGP3ECZ72S"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);
const db = getFirestore(app);

export { 
  auth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  storage,
  db
};