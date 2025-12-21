const router = require("express").Router();
const controller = require("../controllers/user.controller");
const { authMiddleware, adminMiddleware } = require("../middlewares/auth.middleware");

router.get("/", authMiddleware, adminMiddleware, controller.getAllUsers);
//router.get("/me", authMiddleware, controller.getCurrentUser);
router.post("/", authMiddleware, adminMiddleware, controller.createUser);
//router.put("/:id", authMiddleware, adminMiddleware, controller.updateUser);
router.delete("/:id", authMiddleware, adminMiddleware, controller.deleteUser);

module.exports = router;