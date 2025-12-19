import api from './api.js';
import { logout, getCurrentUser } from './auth.js';

let allUsers = [];

document.addEventListener('DOMContentLoaded', async () => {
    // Проверка авторизации
    const user = getCurrentUser();
    if (!user) {
        window.location.href = '/frontend/login.html';
        return;
    }

    // Настройка выхода
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }

    // Загрузка пользователей
    await loadUsers();

    // Настройка модального окна
    setupModal();
});

async function loadUsers() {
    try {
        const users = await api.getAllUsers();
        allUsers = users;
        updateUsersTable();
    } catch (error) {
        console.error('Error loading users:', error);
        showError('Ошибка загрузки пользователей');
    }
}

function updateUsersTable() {
    const tableBody = document.querySelector('.data-table tbody');
    tableBody.innerHTML = '';

    if (!allUsers || allUsers.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="6" style="text-align: center; padding: 40px; color: #718096;">
                Нет пользователей в системе
            </td>
        `;
        tableBody.appendChild(row);
        return;
    }

    const currentUser = getCurrentUser();

    allUsers.forEach(user => {
        const row = document.createElement('tr');
        
        // Бэйджи ролей
        let roleBadge = '';
        let roleClass = '';
        
        if (user.role === 'admin') {
            roleClass = 'role-admin';
            roleBadge = 'Администратор';
        } else if (user.role === 'viewer') {
            roleClass = 'role-viewer';
            roleBadge = 'Наблюдатель';
        } else {
            roleClass = 'role-user';
            roleBadge = 'Пользователь';
        }
        
        // Не показываем кнопку удаления для текущего пользователя
        const canDelete = user.id !== currentUser.id;
        
row.innerHTML = `
<td>${user.id}</td>
<td><strong>${user.email}</strong></td>
<td><span class="role-badge ${roleClass}">${roleBadge}</span></td>
<td>${new Date(user.createdAt).toLocaleDateString()}</td> <!-- Только дата создания -->
<td>
    ${canDelete 
        ? `<button class="btn btn-danger" onclick="deleteUser(${user.id})">Удалить</button>`
        : '<span style="color: #718096; font-size: 14px;">Текущий пользователь</span>'
    }
</td>
`;
        
        tableBody.appendChild(row);
    });
}

function setupModal() {
    const modal = document.getElementById('addUserModal');
    const addBtn = document.querySelector('.btn-primary');
    const closeBtn = modal.querySelector('.modal-close');
    const cancelBtn = modal.querySelector('.btn[style*="e2e8f0"]');
    const form = modal.querySelector('form');

    // Открытие модального окна
    addBtn.addEventListener('click', () => {
        modal.style.display = 'flex';
    });

    // Закрытие модального окна
    [closeBtn, cancelBtn].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                modal.style.display = 'none';
                form.reset();
            });
        }
    });

    // Закрытие по клику вне окна
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            form.reset();
        }
    });

    // Обработка формы
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = form.querySelector('input[type="email"]').value;
        const password = form.querySelector('input[type="password"]').value;
        const role = form.querySelector('select').value;

        if (!email || !password) {
            showError('Заполните все обязательные поля');
            return;
        }

        try {
            await api.createUser({ email, password, role });
            
            // Логируем действие
            await api.createAuditLog({
                userId: getCurrentUser().id,
                action: `Создание пользователя: ${email}`
            });
            
            modal.style.display = 'none';
            form.reset();
            await loadUsers();
            showSuccess('Пользователь успешно создан');
            
        } catch (error) {
            console.error('Error creating user:', error);
            showError('Ошибка при создании пользователя: ' + (error.message || 'Неизвестная ошибка'));
        }
    });

    // Заполняем селект ролями
    const roleSelect = form.querySelector('select');
    if (roleSelect) {
        roleSelect.innerHTML = `
            <option value="admin">Администратор</option>
            <option value="viewer">Наблюдатель</option>
        `;
    }
}

// Глобальные функции
window.deleteUser = async function(userId) {
    const userToDelete = allUsers.find(u => u.id === userId);
    if (!userToDelete) return;

    if (!confirm(`Вы уверены, что хотите удалить пользователя ${userToDelete.email}?`)) {
        return;
    }

    try {
        await api.deleteUser(userId);
        
        // Логируем действие
        await api.createAuditLog({
            userId: getCurrentUser().id,
            action: `Удаление пользователя: ${userToDelete.email}`
        });
        
        await loadUsers();
        showSuccess('Пользователь успешно удален');
        
    } catch (error) {
        console.error('Error deleting user:', error);
        showError('Ошибка при удалении пользователя');
    }
};

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #fed7d7;
        color: #c53030;
        padding: 12px 20px;
        border-radius: 6px;
        z-index: 1000;
        border-left: 4px solid #f56565;
    `;
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => errorDiv.remove(), 5000);
}

function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #c6f6d5;
        color: #276749;
        padding: 12px 20px;
        border-radius: 6px;
        z-index: 1000;
        border-left: 4px solid #48bb78;
    `;
    successDiv.textContent = message;
    document.body.appendChild(successDiv);
    
    setTimeout(() => successDiv.remove(), 5000);
}