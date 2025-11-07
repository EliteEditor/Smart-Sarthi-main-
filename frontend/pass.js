import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

// --- THIS IS THE MODIFIED LINE ---
// We are pointing to your local server (running on port 5000) instead of OnRender
const API_BASE_URL = 'http://localhost:5000/api';
// const API_BASE_URL = 'https://smart-sarthi.onrender.com/api'; // This is the old line

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

let currentPassId = null;
let currentPassDetails = null;
let currentUsageRecords = [];
let currentUserId = null; // Store the user's ID

const toYMD = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// --- NEW DYNAMIC CALENDAR RENDER FUNCTION ---
const renderCalendar = (pass, usageRecords) => {
    const calendarContainer = document.getElementById('usage-calendar');
    calendarContainer.innerHTML = ''; 

    // 1. Get all dates that have been used
    const usedDates = new Set(usageRecords.map(rec => toYMD(rec.date)));
    
    const startDate = new Date(pass.startDate);
    const expiryDate = new Date(pass.expiryDate);

    // 2. Normalize start and end dates to midnight (00:00:00) to avoid time conflicts
    const passStart = new Date(startDate).setHours(0,0,0,0);
    const passEnd = new Date(expiryDate).setHours(0,0,0,0);

    // Calculate how many months to render
    const startMonthValue = startDate.getFullYear() * 12 + startDate.getMonth();
    const endMonthValue = expiryDate.getFullYear() * 12 + expiryDate.getMonth();
    const monthsToRender = endMonthValue - startMonthValue + 1;

    for (let i = 0; i < monthsToRender; i++) {
        const monthDate = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
        const monthName = monthDate.toLocaleString('default', { month: 'long', year: 'numeric' });
        
        const monthWrapper = document.createElement('div');
        monthWrapper.innerHTML = `<h4>${monthName}</h4>`;
        const grid = document.createElement('div');
        grid.className = 'calendar-grid';

        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        daysOfWeek.forEach(day => { 
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-header';
            dayHeader.textContent = day;
            grid.appendChild(dayHeader);
        });

        const firstDayOfMonth = monthDate.getDay();
        for (let j = 0; j < firstDayOfMonth; j++) {
            grid.appendChild(document.createElement('div'));
        }

        const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
            const dayDiv = document.createElement('div');
            dayDiv.className = 'calendar-day';
            dayDiv.textContent = day;
            
            const currentDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
            const currentYMD = toYMD(currentDate);
            
            // Normalize the current checking date to midnight
            const checkDate = new Date(currentDate).setHours(0,0,0,0);

            // --- THE FIX IS HERE ---
            // We check if it's USED first. If it's used, it must be green.
            if (usedDates.has(currentYMD)) {
                dayDiv.classList.add('used');
            } 
            // If not used, we check if it's outside the valid range (Grey)
            else if (checkDate < passStart || checkDate > passEnd) {
                 dayDiv.classList.add('future'); 
            } 
            // Otherwise, it's a valid day that hasn't been used yet (Red)
            else {
                dayDiv.classList.add('not-used');
            }
            grid.appendChild(dayDiv);
        }
        monthWrapper.appendChild(grid);
        calendarContainer.appendChild(monthWrapper);
    }
};

const loadPassData = async (uid) => {
    const mainContent = document.querySelector('.main-content');
    try {
        const response = await fetch(`${API_BASE_URL}/passes/my-pass/${uid}`);
        
        if (!response.ok) {
            mainContent.innerHTML = '<h2>My Pass</h2><p>You do not have an active pass. Purchase one from the Dashboard.</p>';
            return;
        }
        const data = await response.json();
        const pass = data.passDetails;
        
        currentPassId = pass._id;
        currentPassDetails = pass;
        currentUsageRecords = data.usageRecords;

        document.getElementById('pass-id').textContent = pass.passCode;
        document.getElementById('start-date').textContent = toYMD(pass.startDate);
        document.getElementById('expiry-date').textContent = toYMD(pass.expiryDate);
        document.getElementById('start-location').textContent = pass.fromLocation;
        document.getElementById('end-location').textContent = pass.toLocation;
        
        const startDate = new Date(pass.startDate);
        const expiryDate = new Date(pass.expiryDate);
        const today = new Date();
        const totalDuration = expiryDate - startDate;
        const elapsedDuration = today - startDate;
        let progressPercentage = Math.max(0, Math.min(100, (elapsedDuration / totalDuration) * 100));
        document.getElementById('progress-bar').style.width = `${progressPercentage}%`;

        const daysRemaining = Math.ceil(Math.max(0, (expiryDate - today) / (1000 * 60 * 60 * 24)));
        document.getElementById('days-remaining').textContent = `${daysRemaining} days`;

        const viewCalendarBtn = document.getElementById('view-calendar-btn');
        viewCalendarBtn.onclick = () => {
            const calendarContainer = document.getElementById('calendar-container');
            const isVisible = calendarContainer.style.display === 'block';
            if (isVisible) {
                calendarContainer.style.display = 'none';
                viewCalendarBtn.textContent = 'View Calendar';
            } else {
                renderCalendar(currentPassDetails, currentUsageRecords);
                calendarContainer.style.display = 'block';
                viewCalendarBtn.textContent = 'Hide Calendar';
            }
        };

        if (document.getElementById('calendar-container').style.display === 'block') {
            renderCalendar(currentPassDetails, currentUsageRecords);
        }

        // --- NEW: GENERATE QR CODE ---
        generateQRCode(uid);

    } catch (error) {
        console.error('Error:', error);
        mainContent.innerHTML = '<h2>My Pass</h2><p>Could not load your pass information.</p>';
    }
};

// --- NEW: QR CODE GENERATION FUNCTION ---
async function generateQRCode(uid) {
    if (!uid) return;

    const qrCodeDiv = document.getElementById('qrcode');
    const qrMessage = document.getElementById('qr-message');
    
    try {
        // 1. Get the secure token from your backend
        const response = await fetch(`${API_BASE_URL}/passes/my-qr-token/${uid}`);
        if (!response.ok) throw new Error('Could not get QR token');
        const { qrToken } = await response.json();
        
        qrCodeDiv.innerHTML = ''; 

        // 2. Put ONLY the token in the QR code (NO URL)
        new QRCode(qrCodeDiv, {
            text: qrToken, 
            width: 256,
            height: 256,
        });
        qrMessage.textContent = "Scanner refreshes every 24 hours.";
    } catch (error) {
        console.error('QR Code Error:', error);
        qrCodeDiv.innerHTML = `<p style="color:red;">Could not load QR code.</p>`;
    }
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUserId = user.uid; // Store the user's ID
        document.getElementById('user-name').textContent = user.displayName || user.email;
        loadPassData(currentUserId);
    } else {
        window.location.href = 'login.html';
    }
});

document.addEventListener('click', async (event) => {
    const target = event.target;

    if (target.id === 'delete-pass-btn') {
        if (!currentPassId) return;
        if (confirm('Are you sure you want to permanently delete this pass?')) {
            try {
                const response = await fetch(`${API_BASE_URL}/passes/delete/${currentPassId}`, { method: 'DELETE' });
                if (!response.ok) throw new Error('Failed to delete pass.');
                alert('Pass deleted successfully.');
                window.location.reload();
            } catch (error) {
                console.error('Delete error:', error);
                alert('Could not delete the pass.');
            }
        }
    }
});