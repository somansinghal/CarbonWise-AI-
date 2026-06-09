// ==========================================
// CONFIGURATION & CORE UTILS
// ==========================================
// INSERT YOUR GEMINI API KEY HERE
const API_KEY = "";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

// FIREBASE CONFIGURATION
// Replace with your Firebase Project Config
const firebaseConfig = {
    apiKey: "",
    authDomain: "carbonwise-ai-in.firebaseapp.com",
    projectId: "carbonwise-ai-in",
    storageBucket: "carbonwise-ai-in.firebasestorage.app",
    messagingSenderId: "8715198073",
    appId: "1:8715198073:web:7641effaeb8e5537573ea8",
    measurementId: "G-TFKFHE24WP"
  };

let auth, db;
const isFirebaseConfigured = !!firebaseConfig.apiKey && firebaseConfig.apiKey !== "PASTE_YOUR_FIREBASE_WEB_API_KEY_HERE";

if (isFirebaseConfigured) {
    firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
}

// Authentication & State Management via Firebase
const Auth = {
    onReady: function(callback) {
        if (!isFirebaseConfigured) {
            setTimeout(() => {
                showToast("Setup Required: Please add Firebase config in js/core.js", "error");
            }, 500);
            return;
        }

        auth.onAuthStateChanged(async (user) => {
            if (user) {
                let doc;
                try {
                    doc = await db.collection('users').doc(user.uid).get();
                } catch (error) {
                    console.error('Firestore error:', error);
                    showToast('Firestore connection failed. Check Firebase configuration and Firestore rules.', 'error');
                    callback({ uid: user.uid, email: user.email, hasBaseline: false });
                    return;
                }
                if (doc.exists) {
                    callback({
                        uid: user.uid,
                        email: user.email,
                        displayName: user.displayName,
                        name: doc.data().name || user.displayName || (user.email ? user.email.split('@')[0] : 'User'),
                        ...doc.data()
                    });
                } else {
                    callback({ uid: user.uid, email: user.email, hasBaseline: false });
                }
            } else {
                callback(null);
            }
        });
    },
    
    register: async function(name, email, password) {
        if (!isFirebaseConfigured) throw new Error("Firebase not configured!");
        const cred = await auth.createUserWithEmailAndPassword(email, password);
        await cred.user.updateProfile({ displayName: name });
        
        const newUser = { 
            name, 
            email, 
            hasBaseline: false, 
            points: 0, 
            savedTotal: 0, 
            currentFootprint: 0, 
            baselineFootprint: 0, 
            history: [] 
        };
        try {
            await db.collection('users').doc(cred.user.uid).set(newUser);
        } catch (error) {
            console.error('Firestore write error:', error);
            throw new Error('Unable to create user profile in Firestore. Ensure Firestore Database is created and rules allow writes.');
        }
        return cred.user;
    },
    
    login: async function(email, password) {
        if (!isFirebaseConfigured) throw new Error("Firebase not configured!");
        return await auth.signInWithEmailAndPassword(email, password);
    },

    signInWithGoogle: async function() {
        if (!isFirebaseConfigured) throw new Error("Firebase not configured!");
        const provider = new firebase.auth.GoogleAuthProvider();
        const cred = await auth.signInWithPopup(provider);
        const user = cred.user;
        
        // Check if user exists in Firestore
        let doc;
        try {
            doc = await db.collection('users').doc(user.uid).get();
        } catch (error) {
            console.error('Firestore error:', error);
            throw new Error('Firestore is unavailable. Check Firestore setup and rules.');
        }
        if (!doc.exists) {
            // Initialize new user if it's their first time logging in with Google
            const newUser = { 
                name: user.displayName || "Google User", 
                email: user.email, 
                hasBaseline: false, 
                points: 0, 
                savedTotal: 0, 
                currentFootprint: 0, 
                baselineFootprint: 0, 
                history: [] 
            };
            await db.collection('users').doc(user.uid).set(newUser);
        }
        return user;
    },
    
    logout: async function() {
        if (!isFirebaseConfigured) return;
        await auth.signOut();
        window.location.href = 'index.html';
    },
    
    updateCurrentUser: async function(updates) {
        if (!isFirebaseConfigured) return;
        const user = auth.currentUser;
        if (user) {
            try {
                await db.collection('users').doc(user.uid).set(updates, { merge: true });
            } catch (error) {
                console.error('Firestore update error:', error);
                throw error;
            }
        }
    }
};

// Gemini API Fetcher
async function fetchGemini(prompt, sysInstruction = "") {
    if(!API_KEY || API_KEY === "PASTE_YOUR_GEMINI_API_KEY_HERE") {
        return "API_KEY is missing. Please add your Gemini API Key in js/core.js.";
    }

    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: sysInstruction ? { parts: [{ text: sysInstruction }] } : undefined,
        generationConfig: { temperature: 0.7 }
    };

    try {
        const response = await fetch(GEMINI_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if(!response.ok) throw new Error("API Request Failed: " + response.statusText);
        
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error(error);
        return "Error connecting to AI. Please try again later.";
    }
}

// Toast Notification System
function showToast(message, type="success") {
    const toast = document.createElement('div');
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.background = type === 'success' ? 'var(--primary)' : 'var(--danger)';
    toast.style.color = '#fff';
    toast.style.padding = '12px 24px';
    toast.style.borderRadius = '8px';
    toast.style.zIndex = '9999';
    toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
    toast.innerText = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.transition = 'opacity 0.5s ease';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}
