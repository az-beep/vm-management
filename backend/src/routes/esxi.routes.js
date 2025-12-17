const router = require("express").Router();
const controller = require("../controllers/esxi.controller");

router.post("/add", controller.addEsxi);
router.get("/", controller.getAllEsxi);

module.exports = router;
