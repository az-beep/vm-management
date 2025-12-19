// backend/src/app.js

const express = require("express");
const app = express();
const { authMiddleware } = require("./middlewares/auth.middleware"); // добавь

app.use(express.json());

// Открытые роуты (без авторизации)
app.use("/auth", require("./routes/auth.routes"));
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "vm-management-backend",
    timestamp: new Date().toISOString()
  });
});

// Закрытые роуты (требуют авторизации)
app.use("/esxi", authMiddleware, require("./routes/esxi.routes"));
app.use("/vm", authMiddleware, require("./routes/vm.routes"));
app.use("/metrics", authMiddleware, require("./routes/metrics.routes"));
app.use("/logs", authMiddleware, require("./routes/actionLog.routes"));
app.use("/users", authMiddleware, require("./routes/user.routes")); 

// Корневой маршрут (открытый)
app.get("/", (req, res) => {
  res.json({
    message: "✅ VM Management API",
    status: "running",
    version: "1.0.0",
    endpoints: [
      "GET  /",
      "GET  /health",
      "POST /auth/login",
      "GET  /auth/verify",
      "GET  /esxi",
      "POST /esxi/add",
      "GET  /vm",
      "POST /vm",
      "GET  /metrics",
      "GET  /logs",
      "GET  /users",
      "POST /users", 
      "DELETE /users/:id"
    ]
  });
});

// Обработка 404
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use(cors());

module.exports = app;