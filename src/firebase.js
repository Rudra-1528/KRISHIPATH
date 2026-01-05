// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// --- PASTE YOUR CONFIG HERE ---
const firebaseConfig = {
  apiKey: "AIzaSyBZ2lkbkKhcj_VPJruVmZSxTIw08H5oXao", 
  authDomain: "harvest-link-d043f.firebaseapp.com",
  projectId: "harvest-link-d043f",
  storageBucket: "harvest-link-d043f.firebasestorage.app",
  messagingSenderId: "533674439100",
  appId: "1:533674439100:web:50d4d9a61455b2fdfabbb9" 
};
// ------------------------------

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);