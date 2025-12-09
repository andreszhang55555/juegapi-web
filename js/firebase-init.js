// js/firebase-init.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
// import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-analytics.js"; // Opcional

const firebaseConfig = {
    apiKey: "AIzaSyDNvBtyOP9TxoBvI_sEbDOw8q83LY9-G7g",
    authDomain: "juegapi-web.firebaseapp.com",
    projectId: "juegapi-web",
    storageBucket: "juegapi-web.firebasestorage.app",
    messagingSenderId: "694410447262",
    appId: "1:694410447262:web:8cc321a65fb19c4291ee8f",
    measurementId: "G-N41CVKS0R0",
};

// Inicialización
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); // Exportamos auth
export const db = getFirestore(app); // Exportamos db (Firestore)
// const analytics = getAnalytics(app);