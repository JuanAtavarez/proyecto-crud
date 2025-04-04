const API_URL = 'http://localhost:3000/users';
const userForm = document.getElementById('userForm');
const userList = document.getElementById('userList');

// Cargar usuarios al iniciar
document.addEventListener('DOMContentLoaded', loadUsers);

// Manejar formulario
userForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const userData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        age: document.getElementById('age').value || null
    };

    const userId = document.getElementById('userId').value;
    const method = userId ? 'PUT' : 'POST';
    const url = userId ? `${API_URL}/${userId}` : API_URL;

    try {
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        if (!response.ok) throw new Error('Error al guardar');
        userForm.reset();
        loadUsers();
    } catch (error) {
        showAlert(error.message, 'error');
    }
});

// Cargar usuarios
async function loadUsers() {
    try {
        const response = await fetch(API_URL);
        const users = await response.json();
        renderUsers(users);
    } catch (error) {
        showAlert('Error cargando usuarios', 'error');
    }
}

// Renderizar usuarios
function renderUsers(users) {
    userList.innerHTML = users.map(user => `
        <div class="user-card">
            <div>
                <h3>${user.name}</h3>
                <p>📧 ${user.email}</p>
                ${user.age ? `<p>🎂 ${user.age} años</p>` : ''}
            </div>
            <div class="user-actions">
                <button onclick="editUser('${user.id}')">✏️ Editar</button>
                <button onclick="deleteUser('${user.id}')">🗑️ Eliminar</button>
            </div>
        </div>
    `).join('');
}

// Editar usuario
window.editUser = async (id) => {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        const user = await response.json();
        
        document.getElementById('userId').value = user.id;
        document.getElementById('name').value = user.name;
        document.getElementById('email').value = user.email;
        document.getElementById('age').value = user.age || '';
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
        showAlert('Error al cargar usuario', 'error');
    }
};

// Eliminar usuario
window.deleteUser = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
    
    try {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        loadUsers();
    } catch (error) {
        showAlert('Error al eliminar', 'error');
    }
};

// Mostrar alertas
function showAlert(message, type = 'success') {
    const alert = document.createElement('div');
    alert.className = `alert ${type}`;
    alert.textContent = message;
    
    document.body.prepend(alert);
    setTimeout(() => alert.remove(), 3000);
}