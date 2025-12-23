import api from './api.js';
import { logout } from './auth.js';

let currentPage = 1;
const itemsPerPage = 10;
let allLogs = [];
let originalLogs = [];

document.addEventListener('DOMContentLoaded', async () => {
    if (!localStorage.getItem('token')) {
        window.location.href = '../index.html';
        return;
    }

    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }

    await loadAuditLogs();
    setupFilters();

    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', async () => {
            await loadAuditLogs();
        });
    }
});

async function loadAuditLogs() {
    try {
        const logs = await api.getAuditLogs();
        allLogs = logs;
        originalLogs = [...logs];
        updateAuditTable();
        updatePagination();
    } catch (error) {
        console.error('Ошибка загрузки логов аудита:', error);
        showEmptyState();
    }
}

function setupFilters() {
    const applyBtn = document.getElementById('applyAllFilters');
    const resetBtn = document.getElementById('resetAllFilters');
    
    if (!applyBtn || !resetBtn) {
        console.error('Не найдены кнопки фильтров');
        return;
    }

    applyBtn.addEventListener('click', () => {
        applyAllFilters();
    });

    resetBtn.addEventListener('click', () => {
        resetAllFilters();
    });
}

function applyAllFilters() {
    try {
        const eventFilterValue = document.getElementById('eventFilter').value || '';
        const searchTextValue = document.getElementById('searchInput').value.toLowerCase().trim() || '';
        const dateFromValue = document.getElementById('dateFrom').value || '';
        const dateToValue = document.getElementById('dateTo').value || '';
        
        if (!originalLogs || originalLogs.length === 0) {
            console.warn('Нет данных для фильтрации');
            return;
        }
        
        let filteredLogs = [...originalLogs];
        
        if (eventFilterValue) {
            filteredLogs = filteredLogs.filter(log => {
                const action = log.action || '';
                return action.includes(eventFilterValue);
            });
        }
        
        if (searchTextValue) {
            filteredLogs = filteredLogs.filter(log => {
                const searchFields = [
                    log.User?.email || '',
                    log.Vm?.name || '',
                    log.action || '',
                    log.details || '',
                    log.ip || ''
                ].map(field => field.toLowerCase());
                
                return searchFields.some(field => field.includes(searchTextValue));
            });
        }
        
        if (dateFromValue || dateToValue) {
            filteredLogs = filteredLogs.filter(log => {
                if (!log.timestamp) return false;
                
                const logDate = new Date(log.timestamp);
                
                if (dateFromValue && dateToValue) {
                    const fromDate = new Date(dateFromValue);
                    const toDate = new Date(dateToValue + 'T23:59:59');
                    return logDate >= fromDate && logDate <= toDate;
                } else if (dateFromValue) {
                    const fromDate = new Date(dateFromValue);
                    return logDate >= fromDate;
                } else if (dateToValue) {
                    const toDate = new Date(dateToValue + 'T23:59:59');
                    return logDate <= toDate;
                }
                
                return true;
            });
        }
        
        allLogs = filteredLogs;
        currentPage = 1;

        updateAuditTable();
        updatePagination();
        
    } catch (error) {
        console.error('Ошибка при применении фильтров:', error);
    }
}

function resetAllFilters() {
    try {
        document.getElementById('eventFilter').value = '';
        document.getElementById('searchInput').value = '';
        document.getElementById('dateFrom').value = '';
        document.getElementById('dateTo').value = '';
        
        allLogs = [...originalLogs];
        currentPage = 1;
        
        updateAuditTable();
        updatePagination();
        
    } catch (error) {
        console.error('Ошибка при сбросе фильтров:', error);
    }
}

function updateAuditTable() {
    const tableBody = document.querySelector('.data-table tbody');
    if (!tableBody) {
        console.error('Не найдена таблица для обновления');
        return;
    }
    
    tableBody.innerHTML = '';

    if (!allLogs || allLogs.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="7" style="text-align: center; padding: 40px; color: #718096;">
                Нет данных для отображения
            </td>
        `;
        tableBody.appendChild(row);
        return;
    }

    // Пагинация
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageLogs = allLogs.slice(startIndex, endIndex);

    pageLogs.forEach((log, index) => {
        const row = document.createElement('tr');

        let actionColor = '#718096';
        if (log.action) {
            if (log.action.includes('Вход')) actionColor = '#3182ce';
            else if (log.action.includes('Создан')) actionColor = '#48bb78';
            else if (log.action.includes('Изменен') || log.action.includes('Обновление')) actionColor = '#ed8936';
            else if (log.action.includes('Удален')) actionColor = '#f56565';
            else if (log.action.includes('Запуск')) actionColor = '#805ad5';
            else if (log.action.includes('Остановка')) actionColor = '#d53f8c';
        }

        const vmName = log.Vm ? log.Vm.name : '-';
        const userName = log.User ? log.User.email : 'Неизвестный пользователь';
        const displayId = log.id || startIndex + index + 1;

        row.innerHTML = `
            <td>${displayId}</td>
            <td>${log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Нет даты'}</td>
            <td><strong>${userName}</strong></td>
            <td><span style="color: ${actionColor}; font-weight: 500;">${log.action || 'Нет действия'}</span></td>
            <td>${vmName}</td>
            <td>${getActionDetails(log)}</td>
            <td>${log.ip || 'N/A'}</td>
        `;

        tableBody.appendChild(row);
    });
}

function getActionDetails(log) {
    if (log.details) return log.details;

    if (log.action) {
        if (log.action.includes('Вход')) return 'Успешная аутентификация';
        if (log.action.includes('Создан')) return 'Создана новая запись';
        if (log.action.includes('Изменен') || log.action.includes('Обновление')) return 'Конфигурация изменена';
        if (log.action.includes('Удален')) return 'Запись удалена';
    }
    
    if (log.Vm) return `VM: ${log.Vm.name}`;
    return 'Действие выполнено';
}

function updatePagination() {
    const totalPages = Math.ceil(allLogs.length / itemsPerPage);
    const pageInfo = document.querySelector('#pageInfo');
    
    if (pageInfo) {
        pageInfo.textContent = `Страница ${currentPage} из ${totalPages}`;
    }

    const prevBtn = document.querySelector('#prevBtn');
    const nextBtn = document.querySelector('#nextBtn');

    if (prevBtn) {
        prevBtn.disabled = currentPage === 1;
        prevBtn.style.opacity = currentPage === 1 ? '0.5' : '1';
        prevBtn.onclick = () => {
            if (currentPage > 1) {
                currentPage--;
                updateAuditTable();
                updatePagination();
            }
        };
    }

    if (nextBtn) {
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.style.opacity = currentPage === totalPages ? '0.5' : '1';
        nextBtn.onclick = () => {
            if (currentPage < totalPages) {
                currentPage++;
                updateAuditTable();
                updatePagination();
            }
        };
    }
}

function showEmptyState() {
    const tableBody = document.querySelector('.data-table tbody');
    if (tableBody) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 50px;">
                    <div style="color: #718096; font-size: 16px; margin-bottom: 10px;">
                        Данные аудита пока не загружены
                    </div>
                    <button class="btn btn-primary" onclick="location.reload()">
                        Обновить страницу
                    </button>
                </td>
            </tr>
        `;
    }
}