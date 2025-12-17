const router = require("express").Router();

router.get("/", (req, res) => {
  res.json({ message: "VM list endpoint - under construction" });
});

router.get("/:id", (req, res) => {
  res.json({ message: `VM details for ID ${req.params.id} - under construction` });
});

router.post("/", (req, res) => {
  res.json({ message: "Create VM endpoint - under construction" });
});

module.exports = router;