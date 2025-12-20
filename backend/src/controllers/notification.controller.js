const axios = require('axios');

class TelegramNotifier {
  constructor() {
    this.botToken = '8359101654:AAG95K8Mbi_BmCAn4R5WOe37KijuUXSJMi4';
    this.chatId = '977325615';
    this.enabled = !!this.botToken && !!this.chatId;
    
    if (this.enabled) {
      console.log('✅ Telegram notifications enabled');
    } else {
      console.log('⚠️  Telegram notifications disabled - set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID');
    }
  }

  async sendMessage(message, options = {}) {
    if (!this.enabled) {
      console.log('Telegram notification (disabled):', message);
      return { success: false, error: 'Telegram not configured' };
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
      
      console.log('📨 Telegram notification sent:', message.substring(0, 50) + '...');
      return { success: true, data: response.data };
      
    } catch (error) {
      console.error('❌ Telegram send error:', error.message);
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
      vm_status: `${icon} <b>VM Status Changed</b>\n` +
                 `VM: <code>${data.vmName}</code>\n` +
                 `Status: ${data.oldStatus} → ${data.newStatus}\n` +
                 `User: ${data.userEmail}\n` +
                 `Time: ${new Date().toLocaleString()}`,

      cpu_alert: `${icon} <b>High CPU Usage</b>\n` +
                 `VM: <code>${data.vmName}</code>\n` +
                 `CPU: ${data.cpuUsage}%\n` +
                 `Threshold: ${data.threshold}%\n` +
                 `Time: ${new Date().toLocaleString()}`,

      login: `${icon} <b>User Login</b>\n` +
             `User: ${data.email}\n` +
             `Role: ${data.role}\n` +
             `IP: ${data.ip || 'N/A'}\n` +
             `Time: ${new Date().toLocaleString()}`,

      host_down: `🔴 <b>ESXi Host Down!</b>\n` +
                 `Host: <code>${data.hostName}</code>\n` +
                 `IP: ${data.hostIp}\n` +
                 `Status: ${data.status}\n` +
                 `Time: ${new Date().toLocaleString()}`
    };

    return templates[data.template] || `${icon} ${data.message}`;
  }
}

// Создаем экземпляр
const telegramNotifier = new TelegramNotifier();

exports.sendNotification = async (req, res) => {
  try {
    const { type, data, silent = false } = req.body;
    
    const message = telegramNotifier.formatAlert(type, data);
    const result = await telegramNotifier.sendMessage(message, { silent });
    
    if (result.success) {
      res.json({ 
        success: true, 
        message: 'Notification sent',
        telegramMessageId: result.data?.result?.message_id 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: 'Failed to send notification',
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

// Экспортируем для использования в других контроллерах
exports.telegramNotifier = telegramNotifier;