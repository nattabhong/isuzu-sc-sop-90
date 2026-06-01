// ISUZU SC SOP 90 - Main Application Logic
// Training platform with 90-day program tracking

const app = {
    currentUser: null,
    currentPhase: 0,
    completedDays: [],
    isOnline: navigator.onLine
};

// Initialize app when DOM is ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeApp);
} else {
    initializeApp();
}

function initializeApp() {
    console.log("🚀 Initializing ISUZU SC SOP 90 App");
    
    // Wait for Firebase initialization
    waitForFirebase();
    
    // Setup event listeners
    setupEventListeners();
    
    // Load saved progress from localStorage
    loadLocalProgress();
    
    // Render initial UI
    renderApp();
}

function waitForFirebase() {
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds max wait
    
    const checkFirebase = setInterval(() => {
        attempts++;
        
        if (typeof Firebase !== "undefined" && Firebase.initialized) {
            clearInterval(checkFirebase);
            console.log("✅ Firebase ready");
            
            // Listen for auth changes
            onAuthStateChanged((user) => {
                app.currentUser = user;
                renderApp();
            });
        } else if (attempts >= maxAttempts) {
            clearInterval(checkFirebase);
            console.warn("⚠️  Firebase not loaded, running in offline mode");
        }
    }, 100);
}

function setupEventListeners() {
    // Listen for online/offline events
    window.addEventListener("online", () => {
        app.isOnline = true;
        console.log("🌐 Online");
        syncProgress();
    });
    
    window.addEventListener("offline", () => {
        app.isOnline = false;
        console.log("📴 Offline");
    });
}

function renderApp() {
    const root = document.getElementById("root");
    if (!root) return;
    
    if (!app.currentUser) {
        renderAuthPage();
    } else {
        renderTrainingPage();
    }
}

function renderAuthPage() {
    const root = document.getElementById("root");
    
    root.innerHTML = `
        <div class="auth-container">
            <div class="auth-card">
                <h1>ISUZU SC SOP 90</h1>
                <p class="subtitle">โปรแกรมฝึกอบรม 90 วัน</p>
                
                <div id="auth-error" class="error-message" style="display:none;"></div>
                
                <form id="auth-form">
                    <input type="email" id="auth-email" placeholder="อีเมล" required>
                    <input type="password" id="auth-password" placeholder="รหัสผ่าน" required>
                    
                    <button type="submit" id="auth-submit">เข้าสู่ระบบ</button>
                </form>
                
                <button id="auth-toggle" class="secondary-btn">สมัครสมาชิก</button>
            </div>
        </div>
    `;
    
    let isLogin = true;
    
    document.getElementById("auth-toggle").addEventListener("click", () => {
        isLogin = !isLogin;
        const btn = document.getElementById("auth-submit");
        btn.textContent = isLogin ? "เข้าสู่ระบบ" : "สมัครสมาชิก";
    });
    
    document.getElementById("auth-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const email = document.getElementById("auth-email").value;
        const password = document.getElementById("auth-password").value;
        
        setAuthLoading(true);
        
        try {
            if (isLogin) {
                await firebaseLogin(email, password);
            } else {
                await firebaseSignup(email, password);
            }
            app.currentUser = Firebase.currentUser;
            renderApp();
        } catch (error) {
            showAuthError(error.message);
        } finally {
            setAuthLoading(false);
        }
    });
}

function renderTrainingPage() {
    const root = document.getElementById("root");
    
    root.innerHTML = `
        <div class="training-container">
            <header class="app-header">
                <h1>ISUZU SC SOP 90</h1>
                <div class="user-section">
                    <span id="user-name">${app.currentUser?.email || 'ผู้ใช้'}</span>
                    <button id="logout-btn" class="btn-logout">ออกจากระบบ</button>
                </div>
            </header>
            
            <main class="training-content">
                <div class="progress-section">
                    <div class="progress-bar">
                        <div class="progress-fill" id="progress-fill" style="width: 0%"></div>
                    </div>
                    <p id="progress-text" class="progress-text">0 / 90 วัน</p>
                </div>
                
                <div class="sop-grid" id="sop-grid"></div>
            </main>
        </div>
    `;
    
    document.getElementById("logout-btn").addEventListener("click", async () => {
        try {
            await firebaseLogout();
            app.currentUser = null;
            renderApp();
        } catch (error) {
            console.error("Logout error:", error);
        }
    });
    
    renderSOPGrid();
}

function renderSOPGrid() {
    const grid = document.getElementById("sop-grid");
    if (!grid) return;
    
    grid.innerHTML = "";
    
    // Render 90 days
    for (let i = 1; i <= 90; i++) {
        const isCompleted = app.completedDays.includes(i);
        const dayBtn = document.createElement("button");
        dayBtn.className = `day-btn ${isCompleted ? "completed" : ""}`;
        dayBtn.textContent = `วัน ${i}`;
        dayBtn.addEventListener("click", () => toggleDayCompletion(i));
        grid.appendChild(dayBtn);
    }
    
    updateProgress();
}

function toggleDayCompletion(day) {
    const index = app.completedDays.indexOf(day);
    if (index > -1) {
        app.completedDays.splice(index, 1);
    } else {
        app.completedDays.push(day);
    }
    
    saveLocalProgress();
    syncProgress();
    renderSOPGrid();
}

function updateProgress() {
    const completed = app.completedDays.length;
    const percentage = (completed / 90) * 100;
    
    const progressFill = document.getElementById("progress-fill");
    const progressText = document.getElementById("progress-text");
    
    if (progressFill) progressFill.style.width = percentage + "%";
    if (progressText) progressText.textContent = `${completed} / 90 วัน`;
}

function saveLocalProgress() {
    if (app.currentUser) {
        localStorage.setItem(
            `progress_${app.currentUser.uid}`,
            JSON.stringify(app.completedDays)
        );
    }
}

function loadLocalProgress() {
    if (app.currentUser) {
        const saved = localStorage.getItem(`progress_${app.currentUser.uid}`);
        app.completedDays = saved ? JSON.parse(saved) : [];
    }
}

function syncProgress() {
    if (app.currentUser && app.isOnline && typeof saveProgress === "function") {
        saveProgress(app.currentUser.uid, app.completedDays);
    }
}

function setAuthLoading(loading) {
    const submitBtn = document.getElementById("auth-submit");
    if (submitBtn) {
        submitBtn.disabled = loading;
        submitBtn.textContent = loading ? "กำลังโหลด..." : (submitBtn.textContent || "เข้าสู่ระบบ");
    }
}

function showAuthError(message) {
    const errorDiv = document.getElementById("auth-error");
    if (!errorDiv) return;
    
    // Map Firebase error codes to Thai messages
    const errorMessages = {
        "auth/user-not-found": "ไม่พบบัญชีผู้ใช้นี้",
        "auth/wrong-password": "รหัสผ่านไม่ถูกต้อง",
        "auth/email-already-in-use": "อีเมลนี้ถูกใช้งานแล้ว",
        "auth/weak-password": "รหัสผ่านไม่แข็งแรง",
        "auth/invalid-email": "รูปแบบอีเมลไม่ถูกต้อง"
    };
    
    const displayMessage = errorMessages[message] || message;
    errorDiv.textContent = "❌ " + displayMessage;
    errorDiv.style.display = "block";
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        errorDiv.style.display = "none";
    }, 5000);
}
