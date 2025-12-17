const router = require("express").Router();

router.post("/login", (req, res) => {
  res.json({ message: "Login endpoint - under construction" });
});

router.post("/register", (req, res) => {
  res.json({ message: "Register endpoint - under construction" });
});

router.post("/logout", (req, res) => {
  res.json({ message: "Logout endpoint - under construction" });
});

module.exports = router;