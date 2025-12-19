import api from './api.js';
import { logout } from './auth.js';

// Глобальные переменные для графиков
let cpuChart, ramChart, romChart;

document.addEventListener('DOMContentLoaded', async () => {
    // Проверка авторизации
    if (!localStorage.getItem('token')) {
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

    // Загрузка всех данных
    try {
        await Promise.all([
            loadDashboardStats(),
            loadVMsTable(),
            initChartsWithRealData()
        ]);
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showError('Ошибка загрузки данных');
    }

    // Обновление каждые 10 секунд
    setInterval(async () => {
        try {
            await Promise.all([
                loadDashboardStats(),
                loadVMsTable(),
                updateChartsWithRealData()
            ]);
        } catch (error) {
            console.error('Error refreshing data:', error);
        }
    }, 10000);

    // Селектор VM для фильтрации графиков
    const vmSelector = document.querySelector('.vm-selector');
    if (vmSelector) {
        vmSelector.addEventListener('change', async (e) => {
            const selectedVM = e.target.value;
            if (selectedVM === 'Все VM') {
                await initChartsWithRealData();
            } else {
                // Здесь можно реализовать фильтрацию по конкретной VM
                await loadMetricsForVM(selectedVM);
            }
        });
    }
});

async function loadDashboardStats() {
    try {
        const [vms, metrics, esxiHosts] = await Promise.all([
            api.getAllVMs(),
            api.getLatestMetrics(),
            api.getESXiHosts()
        ]);

        // Общие статистики
        const totalVMs = vms.length;
        const runningVMs = vms.filter(vm => vm.status === 'running').length;
        
        // Рассчитываем среднюю CPU за последние метрики
        let totalCPU = 0;
        let cpuCount = 0;
        
        metrics.forEach(metric => {
            if (metric.cpu !== null && metric.cpu !== undefined) {
                totalCPU += metric.cpu;
                cpuCount++;
            }
        });
        
        const avgCPU = cpuCount > 0 ? Math.round(totalCPU / cpuCount) : 0;
        
        // Используемая RAM (сумма RAM всех VM)
        const totalRAM = vms.reduce((sum, vm) => sum + (vm.ram || 0), 0);

        // Обновляем UI
        document.querySelector('.stat-box:nth-child(1) .stat-value').textContent = totalVMs;
        document.querySelector('.stat-box:nth-child(2) .stat-value').textContent = runningVMs;
        document.querySelector('.stat-box:nth-child(3) .stat-value').textContent = `${avgCPU}%`;
        document.querySelector('.stat-box:nth-child(4) .stat-value').textContent = `${(totalRAM / 1024).toFixed(1)} GB`;

        // Статус системы
        const statusElement = document.querySelector('.status');
        if (esxiHosts.length > 0 && esxiHosts.every(h => h.status === 'connected')) {
            statusElement.textContent = '🟢 Система активна';
            statusElement.style.background = '#c6f6d5';
            statusElement.style.color = '#276749';
        } else {
            statusElement.textContent = '🔴 Проблемы с подключением';
            statusElement.style.background = '#fed7d7';
            statusElement.style.color = '#c53030';
        }

    } catch (error) {
        console.error('Error loading stats:', error);
        throw error;
    }
}

async function loadVMsTable() {
    try {
        const [vms, esxiHosts] = await Promise.all([
            api.getAllVMs(),
            api.getESXiHosts()
        ]);

        const tableBody = document.querySelector('.data-table tbody');
        tableBody.innerHTML = '';

        // Создаем маппинг ESXi хостов для быстрого доступа
        const esxiMap = {};
        esxiHosts.forEach(host => {
            esxiMap[host.id] = host;
        });

        vms.forEach(vm => {
            const esxiHost = esxiMap[vm.EsxiHostId] || esxiMap[vm.esxiHostId];
            const row = document.createElement('tr');
            
            const statusClass = vm.status === 'running' ? 'status-running' : 'status-stopped';
            const statusText = vm.status === 'running' ? 'Запущена' : 'Остановлена';
            
            // Добавляем кнопки управления
            const actionButtons = vm.status === 'running' 
                ? `<button class="btn-small btn-warning" onclick="stopVM(${vm.id})">⏹️</button>`
                : `<button class="btn-small btn-success" onclick="startVM(${vm.id})">▶️</button>`;
            
            row.innerHTML = `
                <td><strong>${vm.name}</strong></td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>${vm.cpu || 0}%</td>
                <td>${vm.ram ? (vm.ram / 1024).toFixed(1) + ' GB' : '0 GB'}</td>
                <td>${vm.rom ? vm.rom + ' GB' : '0 GB'}</td>
                <td>${esxiHost ? esxiHost.name : 'N/A'}</td>
                <td>${esxiHost ? esxiHost.ip : 'N/A'}</td>
                <td class="actions">${actionButtons}</td>
            `;
            
            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error('Error loading VMs:', error);
        throw error;
    }
}

async function initChartsWithRealData() {
    try {
        const metrics = await api.getLatestMetrics();
        
        if (!metrics || metrics.length === 0) {
            createEmptyCharts();
            return;
        }

        // Группируем метрики по времени для трендов
        const lastMetrics = metrics.slice(0, 10).reverse(); // Последние 10 записей
        
        const labels = lastMetrics.map(m => 
            new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        );
        
        const cpuData = lastMetrics.map(m => m.cpu || 0);
        const ramData = lastMetrics.map(m => m.ram || 0);
        const romData = lastMetrics.map(m => m.rom || 0);

        createCharts(labels, cpuData, ramData, romData);
        
    } catch (error) {
        console.error('Error loading metrics for charts:', error);
        createEmptyCharts();
    }
}

async function updateChartsWithRealData() {
    try {
        const metrics = await api.getLatestMetrics();
        
        if (!metrics || metrics.length === 0) return;
        
        const lastMetrics = metrics.slice(0, 10).reverse();
        const labels = lastMetrics.map(m => 
            new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        );
        
        const cpuData = lastMetrics.map(m => m.cpu || 0);
        const ramData = lastMetrics.map(m => m.ram || 0);
        const romData = lastMetrics.map(m => m.rom || 0);

        updateCharts(cpuData, ramData, romData, labels);
        
    } catch (error) {
        console.error('Error updating charts:', error);
    }
}

function createCharts(labels, cpuData, ramData, romData) {
    const cpuCtx = document.getElementById('cpuChart').getContext('2d');
    const ramCtx = document.getElementById('ramChart').getContext('2d');
    const romCtx = document.getElementById('romChart').getContext('2d');
    
    // Уничтожаем старые графики если есть
    if (cpuChart) cpuChart.destroy();
    if (ramChart) ramChart.destroy();
    if (romChart) romChart.destroy();
    
    const createChart = (ctx, label, color, data) => {
        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: label,
                    data: data,
                    borderColor: color,
                    backgroundColor: color + '20',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3,
                    pointRadius: 3,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { 
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (context) => `${context.dataset.label}: ${context.parsed.y}%`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: { color: 'rgba(0,0,0,0.05)' },
                        ticks: { 
                            callback: value => value + '%',
                            font: { size: 10 }
                        }
                    },
                    x: { 
                        grid: { display: false },
                        ticks: { font: { size: 9 } }
                    }
                }
            }
        });
    };
    
    cpuChart = createChart(cpuCtx, 'CPU', '#3182ce', cpuData);
    ramChart = createChart(ramCtx, 'RAM', '#48bb78', ramData);
    romChart = createChart(romCtx, 'ROM', '#ed8936', romData);
}

function updateCharts(cpuData, ramData, romData, labels) {
    if (cpuChart && ramChart && romChart) {
        cpuChart.data.labels = labels;
        cpuChart.data.datasets[0].data = cpuData;
        cpuChart.update('none');
        
        ramChart.data.labels = labels;
        ramChart.data.datasets[0].data = ramData;
        ramChart.update('none');
        
        romChart.data.labels = labels;
        romChart.data.datasets[0].data = romData;
        romChart.update('none');
    }
}

function createEmptyCharts() {
    const labels = ['Нет данных'];
    const emptyData = [0];
    createCharts(labels, emptyData, emptyData, emptyData);
}

async function loadMetricsForVM(vmName) {
    try {
        // Сначала получаем все VM для поиска ID по имени
        const vms = await api.getAllVMs();
        const vm = vms.find(v => v.name === vmName);
        
        if (!vm) {
            console.error('VM not found:', vmName);
            return;
        }
        
        const metrics = await api.getVMMetrics(vm.id);
        
        if (!metrics || metrics.length === 0) {
            createEmptyCharts();
            return;
        }
        
        const lastMetrics = metrics.slice(0, 10).reverse();
        const labels = lastMetrics.map(m => 
            new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        );
        
        const cpuData = lastMetrics.map(m => m.cpu || 0);
        const ramData = lastMetrics.map(m => m.ram || 0);
        const romData = lastMetrics.map(m => m.rom || 0);

        createCharts(labels, cpuData, ramData, romData);
        
    } catch (error) {
        console.error('Error loading metrics for VM:', error);
    }
}

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

// Глобальные функции для управления VM
window.startVM = async function(vmId) {
    try {
        await api.startVM(vmId);
        await api.createAuditLog({
            userId: JSON.parse(localStorage.getItem('user')).id,
            vmId: vmId,
            action: 'Запуск VM'
        });
        await loadVMsTable();
        showError('VM успешно запущена');
    } catch (error) {
        console.error('Error starting VM:', error);
        showError('Ошибка при запуске VM');
    }
};

window.stopVM = async function(vmId) {
    try {
        await api.stopVM(vmId);
        await api.createAuditLog({
            userId: JSON.parse(localStorage.getItem('user')).id,
            vmId: vmId,
            action: 'Остановка VM'
        });
        await loadVMsTable();
        showError('VM успешно остановлена');
    } catch (error) {
        console.error('Error stopping VM:', error);
        showError('Ошибка при остановке VM');
    }
};