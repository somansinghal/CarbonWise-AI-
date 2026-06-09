<h1 align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Inter&weight=800&size=40&pause=1000&color=10B981&center=true&vCenter=true&width=500&lines=CarbonWise+AI;Track.+Understand.+Reduce.;Save+the+Planet+" alt="Typing SVG" />
</h1>

<p align="center">
  <strong>An AI-powered sustainability platform that tracks your savings and actively helps you reduce your carbon footprint.</strong>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5"></a>
  <a href="#"><img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3"></a>
  <a href="#"><img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript"></a>
  <a href="#"><img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase"></a>
  <a href="#"><img src="https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white" alt="Gemini"></a>
</p>

<div align="center">
  <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Globe%20Showing%20Americas.png" alt="Globe Showing Americas" width="100" height="100" />
</div>

---

## 🚀 Project Overview

CarbonWise AI bridges the gap between *knowing* your footprint and *reducing* it. While traditional calculators just give you a static number, CarbonWise AI gives you a **Baseline**, allows you to **Track Daily Actions**, and visualizes your **Total Carbon Saved** over time! 

## ✨ Features 

- 🔐 **Firebase Authentication & Firestore:** Multi-page application with a complete registration, login, and protected routing system powered securely by Google Firebase.
  - **Google OAuth Integration:** "Continue with Google" securely logs users in with one click via Firebase's Google Auth Provider.
- 📉 **Savings Tracker:** A dedicated dashboard where you can log sustainable actions (e.g., "Took the bus") and watch your carbon savings increase!
- 🤖 **Gemini AI Integrated:**
  - **AI Analyzer:** Get real-time breakdowns of your lifestyle footprint.
  - **EcoBot Widget:** A floating assistant ready to answer your climate questions at any time.
- 🎨 **Stunning UI with Animations:** Built with modern CSS Glassmorphism, float animations, deep dark-mode themes, ambient background orbs, and responsive grid layouts.
- 🏆 **Gamified Badges:** Earn points for saving carbon and unlock animated achievement badges (*Starter Sprout*, *Green Warrior*, *Planet Guardian*).

## 🛠️ Architecture (Multi-Page App)

No messy single-page spaghetti code! The project is neatly organized:

```text
CarbonWise-AI/
│
├── index.html           # Beautiful Landing Page with CSS animations
├── auth.html            # Registration/Login system connected to Firebase
├── onboarding.html      # Initial footprint calculator baseline setup
├── dashboard.html       # Main application interface and savings tracker
│
├── css/
│   └── style.css        # Global styles, Glassmorphism, Keyframe animations
│
└── js/
    ├── core.js          # Firebase Auth, Firestore DB, Gemini API fetcher
    └── dashboard.js     # Chart.js rendering, Savings logging logic
```

## ⚙️ How to Run Locally (IMPORTANT SETUP)

Because this app uses **Firebase Authentication** and **Firestore Database**, you must provide your project configuration keys for the app to function. 

1. **Get your Gemini API Key:** Open `js/core.js` and locate line 5. Insert your Gemini API Key.
   ```javascript
   const API_KEY = "YOUR_GEMINI_API_KEY_HERE"; 
   ```

2. **Configure Firebase & Google OAuth:** Open `js/core.js` and locate the `firebaseConfig` object around line 10. Replace the placeholders with your actual Firebase Project credentials:
   ```javascript
   const firebaseConfig = {
       apiKey: "AIzaSyYourKeyHere...",
       authDomain: "your-project-id.firebaseapp.com",
       projectId: "your-project-id",
       storageBucket: "your-project-id.appspot.com",
       messagingSenderId: "1234567890",
       appId: "1:1234567890:web:abc123def456"
   };
   ```
   *(Note: Ensure you have Authentication enabled in your Firebase Console. Under "Sign-in Providers", you must enable both **Email/Password** and **Google** auth providers. Finally, enable Firestore Database).*

3. Open `index.html` in your web browser. 
4. Click **Get Started**, register an account securely via Firebase, calculate your baseline, and begin logging your savings!

*(If you fail to configure Firebase, the app will gracefully show an error toast alerting you to complete the setup).*

## 📈 Tracking Savings

The core innovation of CarbonWise AI is the transition from static calculation to **Dynamic Savings**:
1. You calculate a baseline (e.g., `4,000 kg CO2 / year`).
2. You log an action today: *Walked instead of drove*.
3. The app subtracts `2.5 kg` from your footprint, safely saves this state to Firestore, updates your "Total Saved" metric, and plots the progress on your cumulative Chart.js visualization.

## 🏅 Animated Badges

Our dashboard features actively animated CSS badges that unlock and glow as you hit major milestone markers (20kg, 50kg, 100kg saved).

<p align="center">
  <i>Built with ❤️ for Hackathons and a Greener Future.</i>
</p>