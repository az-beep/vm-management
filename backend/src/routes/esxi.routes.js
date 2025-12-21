const router = require("express").Router();
const controller = require("../controllers/esxi.controller");

router.post("/add", controller.addEsxi);
router.get("/", controller.getAllEsxi);
router.get("/:id", controller.getEsxiById);
//router.put("/:id", controller.updateEsxi);
//router.delete("/:id", controller.deleteEsxi);

module.exports = router;