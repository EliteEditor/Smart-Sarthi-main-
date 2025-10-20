import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCcH0GYFUfsl0z2Uv5rgBLvBZhWs3IKepk",
    authDomain: "login-5ed74.firebaseapp.com",
    projectId: "login-5ed74",
    storageBucket: "login-5ed74.firebasestorage.app",
    messagingSenderId: "751070431911",
    appId: "1:751070431911:web:3783cd10afde4ae9152982",
    measurementId: "G-7RNWGFMMNK"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.addEventListener('DOMContentLoaded', () => {
    const planNameEl = document.getElementById('plan-name');
    const routeNameEl = document.getElementById('route-name');
    const totalAmountEl = document.getElementById('total-amount');
    const confirmBtn = document.getElementById('confirm-purchase-btn');
    const statusMessageEl = document.getElementById('status-message');

    // Get pass details from the browser's temporary storage
    const passType = sessionStorage.getItem('passType');
    const routeId = sessionStorage.getItem('routeId');
    const routeName = sessionStorage.getItem('routeName'); // Get the route name

    if (!passType || !routeId || !routeName) {
        alert("Purchase details are missing. Redirecting to dashboard.");
        window.location.href = 'user_dashboard.html';
        return;
    }

    // Set prices and display details
    const prices = { monthly: 300, quarterly: 900 };
    const price = prices[passType];
    planNameEl.textContent = `${passType.charAt(0).toUpperCase() + passType.slice(1)} Pass`;
    totalAmountEl.textContent = `₹${price}`;
    routeNameEl.textContent = routeName;

    onAuthStateChanged(auth, (user) => {
        if (user) {
            confirmBtn.onclick = async () => {
                confirmBtn.disabled = true;
                statusMessageEl.textContent = 'Processing your trial payment...';

                try {
                    const response = await fetch('http://localhost:5000/api/passes/purchase', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId: user.uid, routeId, passType }),
                    });
                    const data = await response.json();

                    if (response.ok) {
                        statusMessageEl.style.color = 'green';
                        statusMessageEl.innerHTML = `Purchase successful! Your pass is now active. <br><a href="pass.html">View My Pass</a>`;
                        confirmBtn.style.display = 'none';
                    } else {
                        throw new Error(data.message);
                    }
                } catch (error) {
                    statusMessageEl.style.color = 'red';
                    statusMessageEl.textContent = `Error: ${error.message}`;
                    confirmBtn.disabled = false;
                }
            };
        } else {
            // If user is not logged in, they shouldn't be here
            window.location.href = 'login.html';
        }
    });
});