document.addEventListener('DOMContentLoaded', () => {
    const userNameHeader = document.getElementById('user-name-header');
    const userEmailHeader = document.getElementById('user-email-header');
    const passListContainer = document.getElementById('pass-list-container');

    // Get the user's UID from the URL query parameter
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('uid');

    if (!userId) {
        passListContainer.innerHTML = '<p>No user specified.</p>';
        return;
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const fetchUserPassHistory = async () => {
        try {
            // --- USE LOCALHOST FOR TESTING ---
            // const API_URL = `http://localhost:5000/api/passes/user/${userId}`;
            const API_URL = `https://smart-sarthi.onrender.com/api/passes/user/${userId}`; // Uncomment this for production

            console.log("Fetching URL:", API_URL);
            const response = await fetch(API_URL);
            
            if (!response.ok) throw new Error('Failed to fetch user data');
            const data = await response.json();

            // Display user info in the header
            userNameHeader.textContent = data.userName;
            userEmailHeader.textContent = data.userEmail;

            if (data.passes.length === 0) {
                passListContainer.innerHTML = '<p>This user has no pass history.</p>';
                return;
            }

            // Create a card for each pass
            data.passes.forEach(pass => {
                const card = document.createElement('div');
                // Adds 'active' or 'expired' class for styling
                card.className = `pass-card ${pass.status}`; 
                
                card.innerHTML = `
                    <p><strong>Pass Code:</strong> ${pass.passCode}</p>
                    <p><strong>Route:</strong> ${pass.fromLocation} → ${pass.toLocation}</p>
                    <p><strong>Type:</strong> ${pass.passType}</p>
                    <p><strong>Validity:</strong> ${formatDate(pass.startDate)} to ${formatDate(pass.expiryDate)}</p>
                    <p><strong>Status:</strong> <span style="font-weight: bold; text-transform: capitalize;">${pass.status}</span></p>
                `;
                passListContainer.appendChild(card);
            });

        } catch (error) {
            console.error('Error:', error);
            passListContainer.innerHTML = '<p>Could not load pass history.</p>';
        }
    };

    fetchUserPassHistory();
});