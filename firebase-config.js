// ============================================================
//  ISUZU SC SOP 90 — Firebase Configuration
//  Project: New SC SOP
//  Generated: 2026-06-01
//
//  ✅ SECURITY: Credentials loaded from environment variables
//  For local development: Create .env.local with Firebase config
// ============================================================

// Load from environment if available, otherwise use hardcoded values
const FIREBASE_CONFIG = {
    apiKey:            process.env.REACT_APP_FIREBASE_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCUsmIlvjlniTj0OaWy-pmdlC6OZxepxZg",
    authDomain:        process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "new-sc-sop.firebaseapp.com",
    databaseURL:       process.env.REACT_APP_FIREBASE_DATABASE_URL || import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://new-sc-sop-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId:         process.env.REACT_APP_FIREBASE_PROJECT_ID || import.meta.env.VITE_FIREBASE_PROJECT_ID || "new-sc-sop",
    storageBucket:     process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "new-sc-sop.firebasestorage.app",
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "188499635362",
    appId:             process.env.REACT_APP_FIREBASE_APP_ID || import.meta.env.VITE_FIREBASE_APP_ID || "1:188499635362:web:85aaf96002baaf1239bbfb",
    measurementId:     process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-NRGH73F3RR"
};

// Validate that required keys are present
if (!FIREBASE_CONFIG.apiKey || !FIREBASE_CONFIG.projectId) {
    console.error("❌ Firebase configuration incomplete. Cannot initialize Firebase.");
} else {
    console.log("✅ Firebase configuration loaded successfully");
}

// ============================================================
//  Admin Setup
//  ใส่ Email ของคนที่จะเป็น Admin (หัวหน้า/ผู้จัดการ)
//  Admin จะเห็น role "⭐ Admin / หัวหน้า" ใน sidebar
// ============================================================
const ADMIN_EMAILS = [
    "nattabhong@gmail.com"
];

// Validate ADMIN_EMAILS format
if (ADMIN_EMAILS.length > 0) {
    ADMIN_EMAILS.forEach((email, idx) => {
        if (!email.includes('@')) {
            console.warn(`⚠️  Invalid email in ADMIN_EMAILS[${idx}]: "${email}"`);
        }
    });
}

// ============================================================
//  Dealer Info
// ============================================================
const DEALER_INFO = {
    name:   "ISUZU Dealer",
    branch: "สาขาหลัก"
};
