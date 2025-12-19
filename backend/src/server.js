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
// server.js (добавляем после sequelize.sync())
/*const createDefaultUsers = async () => {
  const bcrypt = require("bcryptjs");
  const { User } = require("./models");
  
  const users = [
    { email: "admin@vm.local", password: "admin123", role: "admin" },
    { email: "viewer@vm.local", password: "viewer123", role: "viewer" }
  ];
  
  for (const userData of users) {
    const existing = await User.findOne({ where: { email: userData.email } });
    if (!existing) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      await User.create({
        email: userData.email,
        password: hashedPassword,
        role: userData.role
      });
      console.log(`✅ User created: ${userData.email}`);
    }
  }
};

// Вызываем после sync
await createDefaultUsers();*/