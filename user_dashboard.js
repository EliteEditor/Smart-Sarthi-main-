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

const populateRoutesDropdown = async () => {
    const routeSelect = document.getElementById('route-select');
    try {
        const response = await fetch('http://localhost:5000/api/routes');
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        const routes = await response.json();

        routeSelect.innerHTML = '<option value="">-- Select a Route --</option>';
        routes.forEach(route => {
            const option = document.createElement('option');
            option.value = route._id;
            option.textContent = `${route.from} → ${route.to}`;
            routeSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Failed to load routes:', error);
        routeSelect.innerHTML = '<option value="">Could not load routes</option>';
    }
};

const handlePassPurchase = async (userId) => {
    const routeSelect = document.getElementById('route-select');
    const passTypeSelect = document.getElementById('pass-type-select');
    const startDateSelect = document.getElementById('start-date-select');
    const messageDiv = document.getElementById('purchase-message');

    if (!routeSelect.value || !passTypeSelect.value || !startDateSelect.value) {
        messageDiv.textContent = 'Please fill out all fields.';
        messageDiv.style.color = 'red';
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/passes/purchase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: userId,
                routeId: routeSelect.value,
                passType: passTypeSelect.value,
                startDate: startDateSelect.value
            }),
        });

        const data = await response.json();

        if (response.ok) {
            messageDiv.textContent = 'Pass purchased successfully! Go to "My Pass" to view.';
            messageDiv.style.color = 'green';
        } else {
            messageDiv.textContent = `Error: ${data.message}`;
            messageDiv.style.color = 'red';
        }
    } catch (error) {
        console.error('Purchase error:', error);
        messageDiv.textContent = 'An error occurred. Please try again later.';
        messageDiv.style.color = 'red';
    }
};

onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('start-date-select').value = new Date().toISOString().split('T')[0];
        populateRoutesDropdown();
        document.getElementById('purchase-pass-btn').addEventListener('click', () => handlePassPurchase(user.uid));
    } else {
        window.location.href = 'login.html';
    }
});