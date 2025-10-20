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

const handlePassPurchase = () => {
    const routeSelect = document.getElementById('route-select');
    const passTypeSelect = document.getElementById('pass-type-select');
    const messageDiv = document.getElementById('purchase-message');

    if (!routeSelect.value || !passTypeSelect.value) {
        messageDiv.textContent = 'Please select a route and pass type.';
        messageDiv.style.color = 'red';
        return;
    }

    // Get the display text of the selected route
    const selectedRouteText = routeSelect.options[routeSelect.selectedIndex].text;

    // Save the user's choices to the browser's temporary storage
    sessionStorage.setItem('passType', passTypeSelect.value);
    sessionStorage.setItem('routeId', routeSelect.value);
    sessionStorage.setItem('routeName', selectedRouteText);

    // Redirect to the fake payment page
    window.location.href = 'payment.html';
};

onAuthStateChanged(auth, (user) => {
    if (user) {
        populateRoutesDropdown();
        document.getElementById('purchase-pass-btn').addEventListener('click', handlePassPurchase);
    } else {
        window.location.href = 'login.html';
    }
});