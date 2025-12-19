const router = require("express").Router();
const controller = require("../controllers/auth.controller");

router.post("/login", controller.login);
router.get("/verify", controller.verify);

module.exports = router;