// Imports Firebase SDKs for initialization and storage
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-storage.js";

// Firebase configuration for the web app
const firebaseConfig = {
    apiKey: "AIzaSyDE-N43HvOQI5SIFYrbBxKEZPKQAEEZFfE",
    authDomain: "math-falta.firebaseapp.com",
    projectId: "math-falta",
    storageBucket: "math-falta.appspot.com",
    messagingSenderId: "439736325834",
    appId: "1:439736325834:web:8d9516ac69c216a130c633",
    measurementId: "G-7YH3HT9WE1"
  };

// Initializes Firebase app and storage
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage };
