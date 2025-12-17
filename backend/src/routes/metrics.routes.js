const router = require("express").Router();

router.get("/", (req, res) => {
  res.json({ message: "Metrics endpoint - under construction" });
});

router.get("/:vmId", (req, res) => {
  res.json({ message: `Metrics for VM ${req.params.vmId} - under construction` });
});

module.exports = router;