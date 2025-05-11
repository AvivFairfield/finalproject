// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
	apiKey: "AIzaSyC4lE1-K3EZvaaImXiccjBffxbKyppnVu4",
	authDomain: "parkinsphere.firebaseapp.com",
	projectId: "parkinsphere",
	storageBucket: "parkinsphere.firebasestorage.app",
	messagingSenderId: "977397139786",
	appId: "1:977397139786:web:e4d03a32fc19d94497d9b3",
	measurementId: "G-VV61STM29J",
};

// Initialize Firebase
const app = !getApps.length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
