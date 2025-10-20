document.addEventListener('DOMContentLoaded', () => {
    const BUS_API_URL = 'http://localhost:5000/api/buses';
    const ROUTE_API_URL = 'http://localhost:5000/api/routes';

    const modal = document.getElementById('bus-modal');
    const addBusBtn = document.getElementById('add-bus-btn');
    const closeBtn = document.querySelector('.modal .close-btn');
    const cancelBtn = document.querySelector('.modal .cancel-btn');
    const busForm = document.getElementById('bus-form');
    const modalTitle = document.getElementById('modal-title');
    const busTableBody = document.getElementById('bus-table-body');
    const routeSelect = document.getElementById('route');

    // --- Modal Handling ---
    const openModal = (title = "Add New Bus", bus = {}) => {
        modalTitle.textContent = title;
        document.getElementById('bus-id').value = bus._id || '';
        document.getElementById('busNumber').value = bus.busNumber || '';
        document.getElementById('route').value = bus.route?._id || '';
        document.getElementById('departureTime').value = bus.departureTime || '';
        document.getElementById('driverName').value = bus.driverName || '';
        modal.style.display = 'block';
    };

    const closeModal = () => {
        modal.style.display = 'none';
        busForm.reset();
    };

    addBusBtn.onclick = () => openModal();
    closeBtn.onclick = closeModal;
    cancelBtn.onclick = closeModal;
    window.onclick = (event) => {
        if (event.target == modal) closeModal();
    };

    // --- API Functions ---

    // 1. Fetch routes to populate the dropdown select
    const fetchRoutesForDropdown = async () => {
        try {
            const response = await fetch(ROUTE_API_URL);
            const routes = await response.json();
            routeSelect.innerHTML = '<option value="">Select a Route</option>';
            routes.forEach(route => {
                const option = document.createElement('option');
                option.value = route._id;
                option.textContent = `${route.from} → ${route.to}`;
                routeSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error fetching routes for dropdown:', error);
        }
    };

    // 2. Fetch and display all buses
    const fetchBuses = async () => {
        try {
            const response = await fetch(BUS_API_URL);
            const buses = await response.json();
            busTableBody.innerHTML = '';
            buses.forEach(bus => {
                const row = document.createElement('tr');
                const routeName = bus.route ? `${bus.route.from} → ${bus.route.to}` : 'Unassigned';
                row.innerHTML = `
                    <td>${bus.busNumber}</td>
                    <td>${routeName}</td>
                    <td>${bus.departureTime}</td>
                    <td>${bus.driverName}</td>
                    <td>
                        <button class="edit-btn" data-id="${bus._id}">✏️</button>
                        <button class="delete-btn" data-id="${bus._id}">🗑️</button>
                    </td>
                `;
                busTableBody.appendChild(row);
            });
        } catch (error) {
            console.error('Error fetching buses:', error);
        }
    };

    // 3. Handle form submission (Create/Update)
    busForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const id = document.getElementById('bus-id').value;
        const busData = {
            busNumber: document.getElementById('busNumber').value,
            route: document.getElementById('route').value,
            departureTime: document.getElementById('departureTime').value,
            driverName: document.getElementById('driverName').value,
        };

        const method = id ? 'PUT' : 'POST';
        const url = id ? `${BUS_API_URL}/${id}` : BUS_API_URL;

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(busData),
            });
            if (response.ok) {
                closeModal();
                fetchBuses();
            } else console.error('Failed to save bus');
        } catch (error) {
            console.error('Error saving bus:', error);
        }
    });

    // 4. Handle Edit and Delete button clicks
    busTableBody.addEventListener('click', async (event) => {
        const target = event.target;
        const id = target.dataset.id;
        
        if (target.classList.contains('edit-btn')) {
            const response = await fetch(`${BUS_API_URL}`);
            const buses = await response.json();
            const busToEdit = buses.find(bus => bus._id === id);
            if (busToEdit) openModal("Edit Bus", busToEdit);
        }

        if (target.classList.contains('delete-btn')) {
            if (confirm('Are you sure you want to delete this bus?')) {
                try {
                    const response = await fetch(`${BUS_API_URL}/${id}`, { method: 'DELETE' });
                    if (response.ok) fetchBuses();
                    else console.error('Failed to delete bus');
                } catch (error) {
                    console.error('Error deleting bus:', error);
                }
            }
        }
    });

    // Initial data fetch when page loads
    fetchRoutesForDropdown();
    fetchBuses();
});