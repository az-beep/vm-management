const { EsxiHost } = require("../models");

exports.addEsxi = async (req, res) => {
  try {
    const { name, ip } = req.body;
    const esxi = await EsxiHost.create({
      name,
      ip,
      status: "connected",
    });
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
      return res.status(404).json({ error: "ESXi host not found" });
    }
    res.json(esxi);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateEsxi = async (req, res) => {
  try {
    const esxi = await EsxiHost.findByPk(req.params.id);
    if (!esxi) {
      return res.status(404).json({ error: "ESXi host not found" });
    }
    
    const { name, ip, status } = req.body;
    await esxi.update({ name, ip, status });
    res.json(esxi);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteEsxi = async (req, res) => {
  try {
    const esxi = await EsxiHost.findByPk(req.params.id);
    if (!esxi) {
      return res.status(404).json({ error: "ESXi host not found" });
    }
    
    await esxi.destroy();
    res.json({ message: "ESXi host deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};