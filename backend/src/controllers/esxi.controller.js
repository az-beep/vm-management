const { EsxiHost, ActionLog } = require("../models");
const { telegramNotifier } = require('./notification.controller');

exports.addEsxi = async (req, res) => {
  try {
    const { name, ip } = req.body;
    const esxi = await EsxiHost.create({
      name,
      ip,
      status: "connected",
    });
    /*await ActionLog.create({
      userId: req.user.id,
      action: "Добавление ESXi хоста",
      details: `Имя: ${name}, IP: ${ip}`
    });*/

    res.json(esxi);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllEsxi = async (req, res) => {
  try {
    const list = await EsxiHost.findAll();
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getEsxiById = async (req, res) => {
  try {
    const esxi = await EsxiHost.findByPk(req.params.id);
    if (!esxi) {
      return res.status(404).json({ error: "ESXi хост не найден" });
    }
    const isConnected = await checkEsxiConnection(esxi.ip);
    const newStatus = isConnected ? "connected" : "disconnected";
    
    if (esxi.status !== newStatus) {
      await esxi.update({ status: newStatus });
      
      if (newStatus === "disconnected" && telegramNotifier.enabled) {
        telegramNotifier.sendMessage(
          telegramNotifier.formatAlert('host_down', {
            hostName: esxi.name,
            hostIp: esxi.ip,
            status: newStatus
          })
        ).catch(err => {});
      }
    }
    res.json(esxi);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
