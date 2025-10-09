document.addEventListener('DOMContentLoaded', () => {
    const ADMIN_EMAIL = 'editorbro90@gmail.com';
    const userTableBody = document.getElementById('user-table-body');
    const API_URL = 'http://localhost:5000/api/users';

    const formatDate = (dateString) => {
        if (!dateString || dateString === 'N/A') return 'N/A';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const fetchAndDisplayUsers = async () => {
        try {
            userTableBody.innerHTML = '<tr><td colspan="6">Loading users...</td></tr>';
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const users = await response.json();

            userTableBody.innerHTML = '';
            if (users.length === 0) {
                userTableBody.innerHTML = '<tr><td colspan="6">No registered users found.</td></tr>';
                return;
            }

            users.forEach(user => {
                const row = document.createElement('tr');
                
                let nameCellHTML = user.displayName;
                if (user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
                    nameCellHTML += `<span class="admin-badge">Admin</span>`;
                }

                // Use a different CSS class for 'deactivated' status
                const statusClass = user.passStatus === 'active' ? 'active' : 'inactive';

                row.innerHTML = `
                    <td>${user.email}</td>
                    <td>${nameCellHTML}</td>
                    <td>${user.passStatus === 'active' ? 'Monthly' : 'N/A'}</td>
                    <td>${formatDate(user.passExpiry)}</td>
                    <td><span class="status ${statusClass}">${user.passStatus}</span></td>
                    <td>
                        <button class="icon-btn edit-btn" title="Edit User" data-uid="${user.uid}" data-name="${user.displayName}">✏️</button>
                        <button class="icon-btn delete-btn" title="Delete User" data-uid="${user.uid}">🚫</button>
                    </td>
                `;
                userTableBody.appendChild(row);
            });

        } catch (error) {
            console.error('Error fetching users:', error);
            userTableBody.innerHTML = `<tr><td colspan="6">Failed to load users. Please check the console.</td></tr>`;
        }
    };

    // All the button-click event listener code remains the same...
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
                    console.error('Update error:', error);
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
                    console.error('Delete error:', error);
                    alert('Could not delete user.');
                }
            }
        }
    });

    fetchAndDisplayUsers();
});