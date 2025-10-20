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

let currentPassId = null;
let currentPassDetails = null;
let currentUsageRecords = [];

// --- NEW, MORE ROBUST DATE FORMATTING ---
const toYMD = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const renderCalendar = (pass, usageRecords) => {
    const calendarContainer = document.getElementById('usage-calendar');
    calendarContainer.innerHTML = ''; 

    // --- FIX: Use the robust toYMD format for comparison ---
    const usedDates = new Set(usageRecords.map(rec => toYMD(rec.date)));
    const todayYMD = toYMD(new Date());

    const monthsToRender = pass.passType === 'quarterly' ? 3 : 1;
    const startDate = new Date(pass.startDate);

    const checkInBtn = document.getElementById('check-in-btn');
    if (usedDates.has(todayYMD)) {
        checkInBtn.disabled = true;
        checkInBtn.textContent = 'Checked-In Today';
    } else {
        checkInBtn.disabled = false;
        checkInBtn.textContent = 'Check-In for Today';
    }

    for (let i = 0; i < monthsToRender; i++) {
        const monthDate = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
        const monthName = monthDate.toLocaleString('default', { month: 'long', year: 'numeric' });
        
        const monthWrapper = document.createElement('div');
        monthWrapper.innerHTML = `<h4>${monthName}</h4>`;
        const grid = document.createElement('div');
        grid.className = 'calendar-grid';

        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        daysOfWeek.forEach(day => { /* ... (no changes in this loop) ... */ });

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
            
            // --- FIX: Use the robust toYMD format for comparison ---
            const currentYMD = toYMD(currentDate);

            if (currentDate < new Date(pass.startDate) || currentDate > new Date(pass.expiryDate)) {
                 dayDiv.classList.add('future'); 
            } else if (usedDates.has(currentYMD)) {
                dayDiv.classList.add('used');
            } else {
                dayDiv.classList.add('not-used');
            }
            grid.appendChild(dayDiv);
        }
        monthWrapper.appendChild(grid);
        calendarContainer.appendChild(monthWrapper);
    }
};

const loadPassData = async (uid) => {
    // ... (This entire function has NO changes)
    const mainContent = document.querySelector('.main-content');
    try {
        const response = await fetch(`http://localhost:5000/api/passes/my-pass/${uid}`);
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
        document.getElementById('start-date').textContent = toYMD(pass.startDate); // Use consistent formatting
        document.getElementById('expiry-date').textContent = toYMD(pass.expiryDate); // Use consistent formatting
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
    } catch (error) {
        console.error('Error:', error);
        mainContent.innerHTML = '<h2>My Pass</h2><p>Could not load your pass information.</p>';
    }
};

onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('user-name').textContent = user.displayName || user.email;
        loadPassData(user.uid);
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
                const response = await fetch(`http://localhost:5000/api/passes/delete/${currentPassId}`, { method: 'DELETE' });
                if (!response.ok) throw new Error('Failed to delete pass.');
                alert('Pass deleted successfully.');
                window.location.reload();
            } catch (error) {
                console.error('Delete error:', error);
                alert('Could not delete the pass.');
            }
        }
    }

    if (target.id === 'check-in-btn') {
        if (!currentPassId) return;
        target.disabled = true;

        try {
            const response = await fetch('http://localhost:5000/api/passes/usage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ passId: currentPassId })
            });
            
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            alert('Check-in successful!');
            
            // --- THE FINAL FIX ---
            // 1. Update the global usage records with the new data from the API
            currentUsageRecords = data.usageRecords;
            
            // 2. Re-render the calendar using the updated data
            if (currentPassDetails) {
                renderCalendar(currentPassDetails, currentUsageRecords);
            }
            
            // 3. Ensure the calendar is visible to show the change
            document.getElementById('calendar-container').style.display = 'block';
            document.getElementById('view-calendar-btn').textContent = 'Hide Calendar';
            // -----------------------

        } catch (error) {
            console.error('Check-in error:', error);
            alert(`Could not check in: ${error.message}`);
            target.disabled = false;
        }
    }
});

