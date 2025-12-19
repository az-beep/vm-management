
const { Metric, Vm } = require("../models");

exports.addMetric = async (req, res) => {
  try {
    const { vmId, cpu, ram, rom } = req.body;
    const metric = await Metric.create({
      vmId,
      cpu,
      ram,
      rom,
    });
    res.status(201).json(metric);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMetricsByVm = async (req, res) => {
  try {
    const metrics = await Metric.findAll({
      where: { vmId: req.params.vmId },
      order: [["timestamp", "DESC"]],
    });
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getLatestMetrics = async (req, res) => {
  try {
    const metrics = await Metric.findAll({
      include: [{ model: Vm, include: ["EsxiHost"] }],
      order: [["timestamp", "DESC"]],
      limit: 50,
    });
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};