// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCh0ArGzLJhCprULRVX2DxJB9jZrvKN9Ao",
  authDomain: "regalo-john.firebaseapp.com",
  projectId: "regalo-john",
  storageBucket: "regalo-john.firebasestorage.app",
  messagingSenderId: "693989774085",
  appId: "1:693989774085:web:ecce861d8c44ffecb81d6c",
  measurementId: "G-BQMBS4ZLW7"
};

// Initialize Firebase
// Importamos las funciones adicionales que necesitamos
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportamos las herramientas para usarlas en otros componentes
export const db = getFirestore(app);
export const storage = getStorage(app);