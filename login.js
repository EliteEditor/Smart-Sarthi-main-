// login.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCcH0GYFUfsl0z2Uv5rgBLvBZhWs3IKepk",
  authDomain: "login-5ed74.firebaseapp.com",
  projectId: "login-5ed74",
  storageBucket: "login-5ed74.firebasestorage.app",
  messagingSenderId: "751070431911",
  appId: "1:751070431911:web:3783cd10afde4ae9152982",
  measurementId: "G-7RNWGFMMNK"
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);

const handleSuccessfulLogin = (user) => {
    const adminEmails = ["editorbro90@gmail.com"];
    if (adminEmails.includes(user.email.toLowerCase())) {
        alert("✅ Admin login successful!");
        window.location.href = "admin_dashboard.html";
    } else {
        alert("✅ User login successful!");
        window.location.href = "user_dashboard.html";
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const loginBtn  = document.getElementById("login");
    const emailEl   = document.getElementById("email");
    const passEl    = document.getElementById("password");
    
    // --- THIS IS THE FIX ---
    // Correctly select the button inside the div with the class "google-btn"
    const googleBtn = document.querySelector(".google-btn button");
    // -----------------------

    // Logic for Email/Password Login
    loginBtn.addEventListener("click", async () => {
        const email = emailEl.value.trim();
        const password = passEl.value;
        if (!email || !password) {
            alert("⚠ Please enter both email and password.");
            return;
        }
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            handleSuccessfulLogin(userCredential.user);
        } catch (error) {
            console.error("Login error:", error);
            alert("❌ " + (error.message || "Login failed"));
        }
    });

    // Logic for Google Sign-In
    googleBtn.addEventListener("click", async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            handleSuccessfulLogin(result.user);
        } catch (error) {
            console.error("Google Sign-In Error:", error);
            if (error.code !== 'auth/popup-closed-by-user') {
                 alert("❌ An error occurred during Google Sign-In.");
            }
        }
    });
});

// import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
// import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-analytics.js";
// import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

// const firebaseConfig = {
//   apiKey: "AIzaSyCcH0GYFUfsl0z2Uv5rgBLvBZhWs3IKepk",
//   authDomain: "login-5ed74.firebaseapp.com",
//   projectId: "login-5ed74",
//   storageBucket: "login-5ed74.firebasestorage.app",
//   messagingSenderId: "751070431911",
//   appId: "1:751070431911:web:3783cd10afde4ae9152982",
//   measurementId: "G-7RNWGFMMNK"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// try { getAnalytics(app); } catch (_) { /* analytics optional */ }

// const auth = getAuth(app);

// document.addEventListener("DOMContentLoaded", () => {
//   const loginBtn = document.getElementById("login");
//   const emailInput = document.getElementById("email");
//   const passwordInput = document.getElementById("password");

//   loginBtn.addEventListener("click", async () => {
//     const email = emailInput.value.trim();
//     const password = passwordInput.value.trim();

//     if (!email || !password) {
//       alert("⚠ Please enter both email and password.");
//       return;
//     }

//     try {
//       const userCredential = await signInWithEmailAndPassword(auth, email, password);
//       alert("✅ Login successful: " + userCredential.user.email);
//       // Redirect to your user dashboard or any page you want
//       window.location.href = "user_dashboard.html";
//     } catch (error) {
//       console.error("Login error:", error);
//       alert("❌ " + (error.message || "Login failed"));
//     }
//   });
// });
