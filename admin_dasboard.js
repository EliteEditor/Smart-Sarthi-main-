document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:5000/api/routes';

    const modal = document.getElementById('route-modal');
    const addRouteBtn = document.getElementById('add-route-btn');
    const closeBtn = document.querySelector('.modal .close-btn');
    const cancelBtn = document.querySelector('.modal .cancel-btn');
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

    const fetchRoutes = async () => {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const routes = await response.json();
            
            routeTableBody.innerHTML = '';
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
            routeTableBody.innerHTML = `<tr><td colspan="5">Could not load routes.</td></tr>`;
        }
    };

    // Handle form submission (Create/Update)
    routeForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const id = document.getElementById('route-id').value;
        
        // --- THIS IS THE FIX ---
        // We now include placeholder coordinates to satisfy the database model.
        // In a real app, you might use a Geocoding API here to find real coordinates.
        const routeData = {
            from: document.getElementById('from-location').value,
            to: document.getElementById('to-location').value,
            distance: document.getElementById('distance').value,
            duration: document.getElementById('duration').value,
            fromCoords: { lat: 0, lng: 0 }, // Placeholder
            toCoords: { lat: 0, lng: 0 }     // Placeholder
        };
        // -------------------------

        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_URL}/${id}` : API_URL;

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(routeData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Failed to save route: ${errorData.message || 'Unknown error'}`);
            }

            closeModal();
            fetchRoutes(); // Refresh the table with the new data
        } catch (error) {
            console.error('Error saving route:', error);
            alert('Could not save the route. Check the console for details.');
        }
    });

    // Handle Edit and Delete button clicks
    routeTableBody.addEventListener('click', async (event) => {
        const target = event.target;
        const id = target.dataset.id;

        if (target.classList.contains('edit-btn') && id) {
            try {
                // Fetch all routes and find the one to edit
                const response = await fetch(API_URL);
                if (!response.ok) throw new Error('Could not fetch routes for editing.');
                const routes = await response.json();
                const routeToEdit = routes.find(route => route._id === id);
                if (routeToEdit) {
                    openModal("Edit Route", routeToEdit);
                } else {
                    throw new Error('Route not found');
                }
            } catch (error) {
                console.error('Error preparing edit:', error);
                alert('Could not load route details for editing.');
            }
        }

        if (target.classList.contains('delete-btn') && id) {
            if (confirm('Are you sure you want to delete this route?')) {
                try {
                    const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
                    if (!response.ok) throw new Error('Failed to delete route.');
                    fetchRoutes();
                } catch (error) {
                    console.error('Error deleting route:', error);
                    alert('Could not delete the route.');
                }
            }
        }
    });
    
    // Initial data load
    fetchRoutes();
});