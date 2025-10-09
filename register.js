// register.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

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

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!email) {
      alert('Please enter email');
      return;
    }
    if (!password) {
      alert('Please enter password');
      return;
    }
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      alert('Signup successful: ' + user.email);
      signupForm.reset();
      window.location.href = 'user_dashboard.html';
      // optionally redirect to login or dashboard
      // window.location.href = 'login.html';
    } catch (error) {
      console.error('Error during signup:', error);
      alert('Error: ' + error.message);
    }
  });
});
