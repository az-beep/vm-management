const express = require("express");
const app = express();

app.use(express.json());

// Роуты
app.use("/auth", (req, res) => res.json({ message: "Auth endpoint" }));
app.use("/esxi", require("./routes/esxi.routes"));
app.use("/vm", (req, res) => res.json({ message: "VM endpoint" }));
app.use("/metrics", (req, res) => res.json({ message: "Metrics endpoint" }));

// Корневой маршрут
app.get("/", (req, res) => {
  res.json({ 
    message: "✅ VM Management API",
    status: "running",
    version: "1.0.0",
    endpoints: [
      "GET  /",
      "GET  /health",
      "GET  /esxi",
      "POST /esxi/add",
      "GET  /auth",
      "GET  /vm", 
      "GET  /metrics"
    ]
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "healthy",
    service: "vm-management-backend",
    timestamp: new Date().toISOString()
  });
});

// Обработка 404
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

module.exports = app;