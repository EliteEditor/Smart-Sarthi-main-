document.addEventListener('DOMContentLoaded', () => {
    const ADMIN_EMAIL = 'editorbro90@gmail.com';
    const userTableBody = document.getElementById('user-table-body');
    const searchBox = document.querySelector('.search-box'); // Get the search input
    const API_URL = 'https://smart-sarthi.onrender.com/api/users';

    let allUsers = []; // Create a cache to store the full list of users

    const formatDate = (dateString) => {
        if (!dateString || dateString === 'N/A') return 'N/A';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // This function now just renders the user list from a given array
    const renderUserTable = (users) => {
        userTableBody.innerHTML = '';
        if (users.length === 0) {
            userTableBody.innerHTML = '<tr><td colspan="6">No users match your search.</td></tr>';
            return;
        }
        users.forEach(user => {
            const row = document.createElement('tr');
            let nameCellHTML = user.displayName;
            if (user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
                nameCellHTML += `<span class="admin-badge">Admin</span>`;
            }
            const statusClass = user.passStatus === 'active' ? 'active' : 'inactive';
            row.innerHTML = `
                <td>${user.email}</td>
                <td>${nameCellHTML}</td>
                <td>${user.passType === 'N/A' ? 'N/A' : (user.passType.charAt(0).toUpperCase() + user.passType.slice(1))}</td>
                <td>${formatDate(user.passExpiry)}</td>
                <td><span class="status ${statusClass}">${user.passStatus}</span></td>
                <td>
                    <button class="icon-btn edit-btn" title="Edit User" data-uid="${user.uid}" data-name="${user.displayName}">✏️</button>
                    <button class="icon-btn delete-btn" title="Delete User" data-uid="${user.uid}">🚫</button>
                    <a href="admin_user_passes.html?uid=${user.uid}" class="icon-btn" title="View Pass History">ℹ️</a>
                </td>
            `;
            userTableBody.appendChild(row);
        });
    };

    const fetchAndDisplayUsers = async () => {
        try {
            userTableBody.innerHTML = '<tr><td colspan="6">Loading users...</td></tr>';
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            
            allUsers = await response.json(); // Store the full list in our cache
            renderUserTable(allUsers); // Render the full list initially

        } catch (error) {
            console.error('Error fetching users:', error);
            userTableBody.innerHTML = `<tr><td colspan="6">Failed to load users.</td></tr>`;
        }
    };

    // Event listener for button clicks (Edit, Delete)
    userTableBody.addEventListener('click', async (event) => {
        const target = event.target.closest('button');
        if (!target) return;
        const uid = target.dataset.uid;

        if (target.classList.contains('edit-btn')) {
            const currentName = target.dataset.name;
            const newName = prompt('Enter the new name for this user:', currentName);
            if (newName && newName.trim() !== '' && newName !== currentName) {
                try {
                    const response = await fetch(`${API_URL}/${uid}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ displayName: newName }),
                    });
                    if (!response.ok) throw new Error('Failed to update user.');
                    alert('User updated successfully!');
                    fetchAndDisplayUsers();
                } catch (error) {
                    alert('Could not update user.');
                }
            }
        }

        if (target.classList.contains('delete-btn')) {
            if (confirm('Are you sure you want to permanently delete this user?')) {
                try {
                    const response = await fetch(`${API_URL}/${uid}`, { method: 'DELETE' });
                    if (!response.ok) throw new Error('Failed to delete user.');
                    alert('User deleted successfully!');
                    fetchAndDisplayUsers();
                } catch (error) {
                    alert('Could not delete user.');
                }
            }
        }
    });

    // --- THIS IS THE SEARCH FUNCTIONALITY ---
    searchBox.addEventListener('keyup', () => {
        const searchTerm = searchBox.value.toLowerCase().trim();

        if (searchTerm === '') {
            renderUserTable(allUsers); // If search is empty, show all users
            return;
        }

        // Filter the cached user list based on the search term
        const filteredUsers = allUsers.filter(user => {
            return user.email.toLowerCase().includes(searchTerm) ||
                   user.displayName.toLowerCase().includes(searchTerm);
        });

        // Re-render the table with only the filtered users
        renderUserTable(filteredUsers);
    });
    // ---------------------------------------------

    // Initial load of users
    fetchAndDisplayUsers();
});