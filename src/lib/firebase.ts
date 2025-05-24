// src/lib/firebase.ts
import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDGJ4kkNYMpsbZ35UNb6Z4ecq8VvCM_2pA",
  authDomain: "swiftsale-pos-liwm1.firebaseapp.com",
  projectId: "swiftsale-pos-liwm1",
  storageBucket: "swiftsale-pos-liwm1.firebasestorage.app",
  messagingSenderId: "402458670978",
  appId: "1:402458670978:web:bdeff6fdae57cdd4c8419b"
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  console.log("Firebase initialized successfully.");
} catch (error) {
  console.error("Error initializing Firebase:", error);
  // Fallback or error handling, though for core auth this is critical
  // For now, if it fails, auth will be undefined, and subsequent calls will fail.
}

export { app, auth };
