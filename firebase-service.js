// ISUZU SC SOP 90 — Firebase Service Layer
// Handles Firebase Auth and Firestore operations with proper error handling

const Firebase = {};

// Initialize Firebase
try {
    // Load Firebase SDK from CDN if not already loaded
    if (typeof firebase === "undefined") {
        const script = document.createElement("script");
        script.src = "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
        script.onload = () => {
            const authScript = document.createElement("script");
            authScript.src = "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
            authScript.onload = () => {
                const storeScript = document.createElement("script");
                storeScript.src = "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
                storeScript.onload = () => {
                    Firebase.initialized = initializeFirebase();
                };
                document.head.appendChild(storeScript);
            };
            document.head.appendChild(authScript);
        };
        document.head.appendChild(script);
    } else {
        Firebase.initialized = initializeFirebase();
    }
} catch (error) {
    console.error("❌ Firebase initialization failed:", error.message);
    Firebase.initialized = false;
}

function initializeFirebase() {
    try {
        if (typeof firebase === "undefined") return false;
        
        const app = firebase.initializeApp(FIREBASE_CONFIG);
        Firebase.auth = firebase.auth();
        Firebase.db = firebase.firestore();
        
        console.log("✅ Firebase initialized");
        return true;
    } catch (error) {
        console.error("❌ Firebase initialization error:", error.message);
        return false;
    }
}

// Auth State Management
function onAuthStateChanged(callback) {
    try {
        if (!Firebase.auth) {
            console.warn("⚠️  Firebase Auth not initialized, using offline mode");
            callback(null);
            return;
        }
        
        Firebase.auth.onAuthStateChanged((user) => {
            Firebase.currentUser = user;
            callback(user);
        });
    } catch (error) {
        console.error("❌ Auth state listener error:", error.message);
        callback(null);
    }
}

// Login
async function firebaseLogin(email, password) {
    try {
        if (!Firebase.auth) throw new Error("Firebase Auth not initialized");
        
        const result = await Firebase.auth.signInWithEmailAndPassword(email, password);
        Firebase.currentUser = result.user;
        console.log("✅ Login successful:", email);
        return result.user;
    } catch (error) {
        console.error("❌ Login failed:", error.message);
        throw error;
    }
}

// Logout
async function firebaseLogout() {
    try {
        if (!Firebase.auth) throw new Error("Firebase Auth not initialized");
        
        await Firebase.auth.signOut();
        Firebase.currentUser = null;
        console.log("✅ Logout successful");
    } catch (error) {
        console.error("❌ Logout failed:", error.message);
        throw error;
    }
}

// Signup
async function firebaseSignup(email, password) {
    try {
        if (!Firebase.auth) throw new Error("Firebase Auth not initialized");
        
        const result = await Firebase.auth.createUserWithEmailAndPassword(email, password);
        Firebase.currentUser = result.user;
        console.log("✅ Signup successful:", email);
        return result.user;
    } catch (error) {
        console.error("❌ Signup failed:", error.message);
        throw error;
    }
}

// Save Progress to Firestore
async function saveProgress(userId, progressData) {
    try {
        if (!Firebase.db) {
            console.warn("⚠️  Firestore not initialized, saving to localStorage");
            localStorage.setItem(`progress_${userId}`, JSON.stringify(progressData));
            return;
        }
        
        await Firebase.db.collection("users").doc(userId).set(
            {
                progress: progressData,
                lastUpdated: new Date()
            },
            { merge: true }
        );
        console.log("✅ Progress saved to Firestore");
    } catch (error) {
        console.error("❌ Failed to save progress:", error.message);
        localStorage.setItem(`progress_${userId}`, JSON.stringify(progressData));
    }
}

// Load Progress from Firestore
async function loadProgress(userId) {
    try {
        if (!Firebase.db) {
            console.warn("⚠️  Firestore not initialized, loading from localStorage");
            const cached = localStorage.getItem(`progress_${userId}`);
            return cached ? JSON.parse(cached) : null;
        }
        
        const doc = await Firebase.db.collection("users").doc(userId).get();
        if (doc.exists) {
            console.log("✅ Progress loaded from Firestore");
            return doc.data().progress;
        }
        return null;
    } catch (error) {
        console.error("❌ Failed to load progress:", error.message);
        const cached = localStorage.getItem(`progress_${userId}`);
        return cached ? JSON.parse(cached) : null;
    }
}
