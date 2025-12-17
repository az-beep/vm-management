const { EsxiHost } = require("../models");

exports.addEsxi = async (req, res) => {
  const { name, ip } = req.body;

  const esxi = await EsxiHost.create({
    name,
    ip,
    status: "connected",
  });

  res.json(esxi);
};

exports.getAllEsxi = async (req, res) => {
  const list = await EsxiHost.findAll();
  res.json(list);
};
