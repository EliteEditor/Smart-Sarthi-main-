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

// --- MODIFICATION: Global variable to hold the current pass ID ---
let currentPassId = null;

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
};

const renderCalendar = (calendarDays) => {
    const calendarGrid = document.getElementById('usage-calendar');
    calendarGrid.innerHTML = ''; 

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    daysOfWeek.forEach(day => {
        const header = document.createElement('div');
        header.className = 'calendar-header';
        header.textContent = day;
        calendarGrid.appendChild(header);
    });

    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getDay();
    for (let i = 0; i < firstDayOfMonth; i++) {
        calendarGrid.appendChild(document.createElement('div'));
    }

    calendarDays.forEach(dayData => {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        dayDiv.textContent = dayData.day;

        if (dayData.used === true) {
            dayDiv.classList.add('used');
        } else if (dayData.used === false) {
            dayDiv.classList.add('not-used');
        } else {
            dayDiv.classList.add('future');
        }
        calendarGrid.appendChild(dayDiv);
    });
};

const loadPassData = async (uid) => {
    const mainContent = document.querySelector('.main-content');
    try {
        const response = await fetch(`http://localhost:5000/api/passes/my-pass/${uid}`);
        if (!response.ok) {
            if (response.status === 404) {
                mainContent.innerHTML = '<h2>My Pass</h2><p>You do not have an active pass. Purchase one from the Dashboard.</p>';
            } else {
                throw new Error('Failed to load pass data.');
            }
            return;
        }
        const data = await response.json();
        const pass = data.passDetails;

        // --- MODIFICATION: Store the pass ID when data is loaded ---
        currentPassId = pass._id;

        document.getElementById('pass-id').textContent = pass.passCode;
        document.getElementById('start-date').textContent = formatDate(pass.startDate);
        document.getElementById('expiry-date').textContent = formatDate(pass.expiryDate);
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

        renderCalendar(data.calendarDays);

    } catch (error) {
        console.error('Error:', error);
        mainContent.innerHTML = '<h2>My Pass</h2><p>Could not load your pass information. Please try again later.</p>';
    }
};

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User is logged in:", user.uid);
    document.getElementById('user-name').textContent = user.displayName || user.email;
    loadPassData(user.uid);
  } else {
    console.log("No user signed in.");
    window.location.href = 'login.html';
  }
});

// --- MODIFICATION: ADD NEW EVENT LISTENER FOR THE DELETE BUTTON ---
document.addEventListener('click', async (event) => {
    if (event.target.id === 'delete-pass-btn') {
        if (!currentPassId) {
            alert('No pass selected to delete.');
            return;
        }

        if (confirm('Are you sure you want to permanently delete this pass? This action cannot be undone.')) {
            try {
                const response = await fetch(`http://localhost:5000/api/passes/delete/${currentPassId}`, {
                    method: 'DELETE'
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to delete pass.');
                }
                
                alert('Pass deleted successfully.');
                window.location.reload(); // Reload the page

            } catch (error) {
                console.error('Delete error:', error);
                alert(`Could not delete the pass: ${error.message}`);
            }
        }
    }
});
