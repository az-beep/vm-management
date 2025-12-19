// backend/src/routes/user.routes.js
const router = require("express").Router();
const controller = require("../controllers/user.controller");
const { authMiddleware, adminMiddleware } = require("../middlewares/auth.middleware");

// Получить всех пользователей (только для админов)
router.get("/", authMiddleware, adminMiddleware, controller.getAllUsers);

// Получить текущего пользователя
router.get("/me", authMiddleware, controller.getCurrentUser);

// Создать пользователя (только для админов)
router.post("/", authMiddleware, adminMiddleware, controller.createUser);

// Обновить пользователя (только для админов)
router.put("/:id", authMiddleware, adminMiddleware, controller.updateUser);

// Удалить пользователя (только для админов)
router.delete("/:id", authMiddleware, adminMiddleware, controller.deleteUser);

module.exports = router;