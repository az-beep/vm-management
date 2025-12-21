const axios = require('axios');

class TelegramNotifier {
  constructor() {
    this.botToken = '8359101654:AAG95K8Mbi_BmCAn4R5WOe37KijuUXSJMi4';
    this.chatId = '977325615';
    this.enabled = !!this.botToken && !!this.chatId;
    
    if (this.enabled) {
      console.log('Уведомления Telegram включены');
    } else {
      console.log('Уведомления Telegram отключены');
    }
  }

  async sendMessage(message, options = {}) {
    if (!this.enabled) {
      console.log('Уведомление Telegram (отключено):', message);
      return { success: false, error: 'Telegram не настроен' };
    }

    try {
      const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
      
      const payload = {
        chat_id: this.chatId,
        text: message,
        parse_mode: 'HTML',
        disable_notification: options.silent || false,
        ...options
      };

      const response = await axios.post(url, payload);
      
      console.log('Уведомление Telegram отправлено:', message.substring(0, 50) + '...');
      return { success: true, data: response.data };
      
    } catch (error) {
      console.error('Ошибка отправки Telegram:', error.message);
      return { 
        success: false, 
        error: error.message,
        details: error.response?.data 
      };
    }
  }

  formatAlert(type, data) {
    const icons = {
      critical: '🔴',
      warning: '🟡', 
      info: '🔵',
      success: '🟢'
    };

    const icon = icons[type] || '⚪';
    
    const templates = {
      login: `${icons.success} <b>Вход пользователя</b>\n` +
             `Пользователь: ${data.email}\n` +
             `Роль: ${data.role}\n` +
             `IP: ${data.ip || 'Н/Д'}\n` +
             `Время: ${new Date().toLocaleString()}`,
      
      vm_status: `${icons.info} <b>Статус ВМ изменен</b>\n` +
                 `ВМ: <code>${data.vmName}</code>\n` +
                 `Статус: ${data.oldStatus} → ${data.newStatus}\n` +
                 `Пользователь: ${data.userEmail}\n` +
                 `Время: ${new Date().toLocaleString()}`,

      cpu_alert: `${icons.warning} <b>Высокая загрузка CPU</b>\n` +
                 `ВМ: <code>${data.vmName}</code>\n` +
                 `CPU: ${data.cpuUsage}%\n` +
                 `Порог: ${data.threshold}%\n` +
                 `Время: ${new Date().toLocaleString()}`,

      host_down: `${icons.critical} <b>ESXi хост недоступен!</b>\n` +
                 `Хост: <code>${data.hostName}</code>\n` +
                 `IP: ${data.hostIp}\n` +
                 `Статус: ${data.status}\n` +
                 `Время: ${new Date().toLocaleString()}`
    };

    return templates[type] || `${icon} ${data.message || JSON.stringify(data)}`;
  }
}

const telegramNotifier = new TelegramNotifier();

exports.sendNotification = async (req, res) => {
  try {
    const { type, data, silent = false } = req.body;
    
    const message = telegramNotifier.formatAlert(type, data);
    const result = await telegramNotifier.sendMessage(message, { silent });
    
    if (result.success) {
      res.json({ 
        success: true, 
        message: 'Уведомление отправлено',
        telegramMessageId: result.data?.result?.message_id 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: 'Не удалось отправить уведомление',
        details: result.error 
      });
    }
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getStatus = (req, res) => {
  res.json({
    enabled: telegramNotifier.enabled,
    service: 'telegram',
    configured: !!telegramNotifier.botToken && !!telegramNotifier.chatId
  });
};

exports.telegramNotifier = telegramNotifier;