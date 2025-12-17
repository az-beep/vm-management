const app = require("./app");

// Импортируем sequelize напрямую из database.js
const sequelize = require("./config/database");

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    console.log("🔗 Connecting to database...");
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");
    
    console.log("🔄 Syncing database tables...");
    await sequelize.sync({ alter: true });
    console.log("✅ Database tables synced");
    
    app.listen(PORT, () => {
      console.log("=".repeat(50));
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 API: http://localhost:${PORT}`);
      console.log("=".repeat(50));
      console.log("\nAvailable endpoints:");
      console.log(`  GET  http://localhost:${PORT}/`);
      console.log(`  GET  http://localhost:${PORT}/health`);
      console.log(`  GET  http://localhost:${PORT}/esxi`);
      console.log(`  POST http://localhost:${PORT}/esxi/add`);
      console.log("=".repeat(50));
    });
    
  } catch (err) {
    console.error("❌ Database error:", err.message);
    process.exit(1);
  }
})();