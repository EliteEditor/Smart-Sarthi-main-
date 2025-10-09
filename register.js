// register.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-analytics.js";
// --- Step 1: Import updateProfile ---
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCcH0GYFUfsl0z2Uv5rgBLvBZhWs3IKepk",
  authDomain: "login-5ed74.firebaseapp.com",
  projectId: "login-5ed74",
  storageBucket: "login-5ed74.firebasestorage.app",
  messagingSenderId: "751070431911",
  appId: "1:751070431911:web:3783cd10afde4ae9152982",
  measurementId: "G-7RNWGFMMNK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
try {
  getAnalytics(app);
} catch (e) {
  // analytics may not work in all environments
}

const auth = getAuth(app);

document.addEventListener('DOMContentLoaded', () => {
  const signupForm = document.getElementById('signupForm');
  const cancelBtn = document.getElementById('cancelBtn');

  cancelBtn.addEventListener('click', (e) => {
    signupForm.reset();
  });

  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // --- Step 2: Get the full name from the form ---
    const fullName = document.getElementById('fullname').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!fullName) {
      alert('Please enter your full name');
      return;
    }
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      // First, create the user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // --- Step 3: Update the user's profile with the name ---
      // This adds the "displayName" to the user's account
      await updateProfile(userCredential.user, {
        displayName: fullName
      });

      alert('Signup successful: ' + userCredential.user.email);
      signupForm.reset();
      window.location.href = 'user_dashboard.html';

    } catch (error) {
      console.error('Error during signup:', error);
      alert('Error: ' + error.message);
    }
  });
});