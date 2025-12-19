
const { ActionLog, User, Vm } = require("../models");

exports.createLog = async (req, res) => {
  try {
    const { userId, vmId, action } = req.body;
    const log = await ActionLog.create({ userId, vmId, action });
    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllLogs = async (req, res) => {
  try {
    const logs = await ActionLog.findAll({
      include: [User, Vm],
      order: [["timestamp", "DESC"]],
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getLogsByUser = async (req, res) => {
  try {
    const logs = await ActionLog.findAll({
      where: { userId: req.params.userId },
      include: [User, Vm],
      order: [["timestamp", "DESC"]],
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};