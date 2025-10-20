import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCcH0GYFUfsl0z2Uv5rgBLvBZhWs3IKepk",
  authDomain: "login-5ed74.firebaseapp.com",
  projectId: "login-5ed74",
  storageBucket: "login-5ed74.firebasestorage.app",
  messagingSenderId: "751070431911",
  appId: "1:751070431911:web:3783cd10afde4ae9152982",
  measurementId: "G-7RNWGFMMNK"
};

// Initialize Firebase and get the auth service
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// --- AUTOMATIC AUTHENTICATION CHECK ---
// This function runs on any page that includes this script.
// If the user is not logged in, it automatically redirects them to the login page.
onAuthStateChanged(auth, (user) => {
  if (!user) {
    console.log("No user is signed in. Redirecting to login page.");
    // Make sure we are not already on the login page to avoid an infinite loop
    if (window.location.pathname.indexOf('login.html') === -1) {
        window.location.href = "login.html";
    }
  }
});

// --- LOGOUT BUTTON FUNCTIONALITY ---
// This function finds any button with the class "logout-button" and makes it work.
function setupLogoutButton() {
    // We target a class instead of an ID to work on multiple pages easily.
    const logoutBtn = document.querySelector(".logout-button"); 
    
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            if (confirm("Are you sure you want to log out?")) {
                try {
                    await signOut(auth);
                    // After successful logout, redirect to the login page
                    window.location.href = "index.html";
                } catch (error) {
                    console.error("Logout Error:", error);
                    alert("Error logging out: " + error.message);
                }
            }
        });
    }
}

// Run the setup function as soon as the page's HTML is loaded.
document.addEventListener('DOMContentLoaded', setupLogoutButton);