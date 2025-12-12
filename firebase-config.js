// Pro Bono - Firebase Configuration
// Using Firebase CDN (compat version for simpler usage)

const firebaseConfig = {
    apiKey: "AIzaSyDKZ-EWTfILs_QhH7yvmG46mUavOiVHfLw",
    authDomain: "probono-8f620.firebaseapp.com",
    projectId: "probono-8f620",
    storageBucket: "probono-8f620.firebasestorage.app",
    messagingSenderId: "716047268478",
    appId: "1:716047268478:web:0d8bca95197bf4baa3b62f",
    measurementId: "G-X51TVPRC71"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();

// Export for use in other files
window.firebaseAuth = auth;
window.firebaseDb = db;
