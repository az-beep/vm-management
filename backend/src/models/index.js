const sequelize = require("../config/database");

const User = require("./User");
const EsxiHost = require("./EsxiHost");
const Vm = require("./Vm");
const Metric = require("./Metric");
const ActionLog = require("./ActionLog");

// связи
EsxiHost.hasMany(Vm, { foreignKey: "esxiHostId" });
Vm.belongsTo(EsxiHost, { foreignKey: "esxiHostId" });

Vm.hasMany(Metric, { foreignKey: "vmId" });
Metric.belongsTo(Vm, { foreignKey: "vmId" });

User.hasMany(ActionLog, { foreignKey: "userId" });
ActionLog.belongsTo(User, { foreignKey: "userId" });

module.exports = {
  sequelize,
  User,
  EsxiHost,
  Vm,
  Metric,
  ActionLog,
};
