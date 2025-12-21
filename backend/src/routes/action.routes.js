const router = require("express").Router();
const controller = require("../controllers/actionlog.controller");

router.post("/", controller.createLog);
router.get("/", controller.getAllLogs);
//router.get("/user/:userId", controller.getLogsByUser);

module.exports = router;