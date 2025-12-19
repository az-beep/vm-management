// backend/src/server.js
const app = require("./app");
const sequelize = require("./config/database");

const PORT = process.env.PORT || 5000;

const createDefaultUsers = async () => {
  const { User } = require("./models");
  const bcrypt = require("bcryptjs");
  
  try {
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
  } catch (error) {
    console.error("❌ Error creating users:", error.message);
  }
};

// Основная асинхронная функция
const startServer = async () => {
  try {
    console.log("🔗 Connecting to database...");
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");

    console.log("🔄 Syncing database tables...");
    await sequelize.sync({ alter: true });
    console.log("✅ Database tables synced");

    console.log("👤 Creating default users...");
    await createDefaultUsers();

    app.listen(PORT, () => {
      console.log("=".repeat(50));
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 API: http://localhost:${PORT}`);
      console.log(`🗄️  Adminer: http://localhost:8080`);
      console.log("=".repeat(50));
    });

  } catch (err) {
    console.error("❌ Startup error:", err.message);
    process.exit(1);
  }
};

// Запускаем сервер
startServer();