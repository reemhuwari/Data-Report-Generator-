// routes/user.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/User");

// ✅ تسجيل مستخدم جديد
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // تحقق من وجود نفس الإيميل
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser)
      return res.status(400).json({ error: "User already exists!" });

    // تجزئة كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10);

    // إنشاء المستخدم
    const userId = await UserModel.createUser({
      username,
      email,
      password: hashedPassword,
      role,
    });

    res.status(201).json({ message: "User registered successfully!", userId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed", detail: err.message });
  }
});

// ✅ تسجيل الدخول
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findByEmail(email);
    if (!user) return res.status(400).json({ error: "Invalid email or password" });

    // تحقق من كلمة المرور
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ error: "Invalid email or password" });

    // إنشاء توكن JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || "defaultsecret",
      { expiresIn: "1d" }
    );

    res.json({ message: "Login successful!", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed", detail: err.message });
  }
});


// POST /api/user/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // تحقق من المستخدم في قاعدة البيانات
    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // تحقق من الموافقة (اختياري)
    if (!user.isApproved) {
      return res.status(401).json({ error: "User is not approved by admin" });
    }

    // مقارنة كلمة السر
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // إنشاء توكن JWT
    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: { id: user.id, username: user.username, role: user.role }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error", detail: error.message });
  }
});

module.exports = router;


module.exports = router;
