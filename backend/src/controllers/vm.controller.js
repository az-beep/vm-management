const { Vm, EsxiHost, Metric, ActionLog } = require("../models");
const { telegramNotifier } = require('./notification.controller');

exports.createVm = async (req, res) => {
  try {
    const { name, cpu, ram, rom, esxiHostId } = req.body;
    const vm = await Vm.create({
      name,
      cpu,
      ram,
      rom,
      esxiHostId,
      status: "stopped",
    });
    res.status(201).json(vm);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllVms = async (req, res) => {
  try {
    const vms = await Vm.findAll({ include: EsxiHost });
    res.json(vms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getVmById = async (req, res) => {
  try {
    const vm = await Vm.findByPk(req.params.id, { include: [EsxiHost, Metric] });
    if (!vm) {
      return res.status(404).json({ error: "VM not found" });
    }
    res.json(vm);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateVm = async (req, res) => {
  try {
    const vm = await Vm.findByPk(req.params.id);
    if (!vm) {
      return res.status(404).json({ error: "VM not found" });
    }
    const { name, cpu, ram, rom, status, esxiHostId } = req.body;
    await vm.update({ name, cpu, ram, rom, status, esxiHostId });
    res.json(vm);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteVm = async (req, res) => {
  try {
    const vm = await Vm.findByPk(req.params.id);
    if (!vm) {
      return res.status(404).json({ error: "VM not found" });
    }
    await vm.destroy();
    res.json({ message: "VM deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Запуск/остановка VM (имитация)
exports.startVm = async (req, res) => {
  try {
    const vm = await Vm.findByPk(req.params.id, { include: [User] });
    if (!vm) {
      return res.status(404).json({ error: "VM not found" });
    }

    const oldStatus = vm.status;
    await vm.update({ status: "running" });
    
    // Отправляем уведомление
    if (telegramNotifier.enabled) {
      telegramNotifier.sendMessage(
        telegramNotifier.formatAlert('vm_status', {
          vmName: vm.name,
          oldStatus: oldStatus,
          newStatus: 'running',
          userEmail: req.user.email,
          template: 'vm_status'
        })
      ).catch(err => console.error('Notification error:', err));
    }

    res.json({ message: "VM started", vm });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.stopVm = async (req, res) => {
  try {
    const vm = await Vm.findByPk(req.params.id);
    if (!vm) {
      return res.status(404).json({ error: "VM not found" });
    }
    await vm.update({ status: "stopped" });
    res.json({ message: "VM stopped", vm });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};