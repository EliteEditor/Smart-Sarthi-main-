
document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:5000/api/routes';

    const modal = document.getElementById('route-modal');
    const addRouteBtn = document.getElementById('add-route-btn');
    const closeBtn = document.querySelector('.close-btn');
    const cancelBtn = document.querySelector('.cancel-btn');
    const routeForm = document.getElementById('route-form');
    const modalTitle = document.getElementById('modal-title');
    const routeTableBody = document.getElementById('route-table-body');

    // --- Modal Handling ---
    const openModal = (title = "Add New Route", route = {}) => {
        modalTitle.textContent = title;
        document.getElementById('route-id').value = route._id || '';
        document.getElementById('from-location').value = route.from || '';
        document.getElementById('to-location').value = route.to || '';
        document.getElementById('distance').value = route.distance || '';
        document.getElementById('duration').value = route.duration || '';
        modal.style.display = 'block';
    };

    const closeModal = () => {
        modal.style.display = 'none';
        routeForm.reset();
    };

    addRouteBtn.onclick = () => openModal();
    closeBtn.onclick = closeModal;
    cancelBtn.onclick = closeModal;
    window.onclick = (event) => {
        if (event.target == modal) {
            closeModal();
        }
    };

    // --- API Functions ---

    // 1. Fetch and display all routes
    const fetchRoutes = async () => {
        try {
            const response = await fetch(API_URL);
            const routes = await response.json();
            
            routeTableBody.innerHTML = ''; // Clear existing table rows
            routes.forEach(route => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${route.from}</td>
                    <td>${route.to}</td>
                    <td>${route.distance}</td>
                    <td>${route.duration}</td>
                    <td>
                        <button class="edit-btn" data-id="${route._id}">✏️</button>
                        <button class="delete-btn" data-id="${route._id}">🗑️</button>
                    </td>
                `;
                routeTableBody.appendChild(row);
            });
        } catch (error) {
            console.error('Error fetching routes:', error);
        }
    };

    // 2. Handle form submission (Create/Update)
    routeForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const id = document.getElementById('route-id').value;
        const routeData = {
            from: document.getElementById('from-location').value,
            to: document.getElementById('to-location').value,
            distance: document.getElementById('distance').value,
            duration: document.getElementById('duration').value,
        };

        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_URL}/${id}` : API_URL;

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(routeData),
            });

            if (response.ok) {
                closeModal();
                fetchRoutes(); // Refresh the table
            } else {
                console.error('Failed to save route');
            }
        } catch (error) {
            console.error('Error saving route:', error);
        }
    });

    // 3. Handle Edit and Delete button clicks
    routeTableBody.addEventListener('click', async (event) => {
        const target = event.target;
        const id = target.dataset.id;

        // Handle Edit
        if (target.classList.contains('edit-btn')) {
            const response = await fetch(`${API_URL}`);
            const routes = await response.json();
            const routeToEdit = routes.find(route => route._id === id);
            if(routeToEdit) openModal("Edit Route", routeToEdit);
        }

        // Handle Delete
        if (target.classList.contains('delete-btn')) {
            if (confirm('Are you sure you want to delete this route?')) {
                try {
                    const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
                    if (response.ok) {
                        fetchRoutes(); // Refresh the table
                    } else {
                        console.error('Failed to delete route');
                    }
                } catch (error) {
                    console.error('Error deleting route:', error);
                }
            }
        }
    });

    // Initial fetch of routes when the page loads
    fetchRoutes();
    // Find the button with class="back-button" and make it functional.
    const logoutBtn = document.querySelector('.logout-button'); 
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            if (confirm("Are you sure you want to log out?")) {
                try {
                    await signOut(auth);
                    window.location.href = "login.html";
                } catch (error) {
                    console.error("Logout Error:", error);
                    alert("Error logging out: " + error.message);
                }
            }
        });
    }
});
