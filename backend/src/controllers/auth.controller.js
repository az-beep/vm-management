const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      console.log("User not found");
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    console.log("User found, ID:", user.id);
    console.log("Stored hash:", user.password.substring(0, 30) + "...");
    
    const cleanPassword = password.trim();
    const cleanHash = user.password.trim();
    
    const validPassword = await bcrypt.compare(cleanPassword, cleanHash);
    
    console.log("Password comparison result:", validPassword);
    
    if (!validPassword) {
      console.log("Password mismatch");
      
      console.log("Input password:", cleanPassword);
      console.log("Hash length:", cleanHash.length);
      
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "24h" }
    );
    
    console.log("Login successful, token generated");
    
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      } 
    });
    
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.verify = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, "secret");
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    res.json({ valid: true, user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};