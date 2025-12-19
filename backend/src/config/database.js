// backend/src/config/database.js
const { Sequelize } = require("sequelize");

console.log('🔧 Database configuration:');
console.log('  DB_HOST:', process.env.DB_HOST || 'postgres');
console.log('  DB_NAME:', process.env.DB_NAME || 'vm_db');
console.log('  DB_USER:', process.env.DB_USER || 'admin');
console.log('  DB_PASS:', process.env.DB_PASS ? '***' : 'admin');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'vm_db', 
  process.env.DB_USER || 'admin', 
  process.env.DB_PASS || 'admin', 
  {
    host: process.env.DB_HOST || 'postgres',
    port: process.env.DB_PORT || 5432,
    dialect: "postgres",
    logging: false,
  }
);

module.exports = sequelize;