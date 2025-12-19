const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "24h" }
    );
    
    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

exports.verify = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    res.json({ valid: true, user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};