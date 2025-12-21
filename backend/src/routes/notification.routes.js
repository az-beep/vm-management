const router = require("express").Router();
const controller = require("../controllers/notification.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

//router.post("/send", authMiddleware, controller.sendNotification);
//router.get("/status", authMiddleware, controller.getStatus);

module.exports = router;