const express = require("express");
const app = express();
const cors = require("cors");
const { authMiddleware } = require("./middlewares/auth.middleware"); 

app.use(cors({
  origin: ['https://localhost:443', 'https://localhost', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(express.json());

app.use("/auth", require("./routes/auth.routes"));
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "vm-management-backend",
    timestamp: new Date().toISOString()
  });
});

app.use("/esxi", authMiddleware, require("./routes/esxi.routes"));
app.use("/vm", authMiddleware, require("./routes/vm.routes"));
app.use("/metrics", authMiddleware, require("./routes/metrics.routes"));
app.use("/logs", authMiddleware, require("./routes/action.routes"));
app.use("/users", authMiddleware, require("./routes/user.routes")); 

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

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});


module.exports = app;