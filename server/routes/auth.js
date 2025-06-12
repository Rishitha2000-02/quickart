const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../db');
const bcrypt = require('bcryptjs');
const router = express.Router();

// User signup
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.execute('INSERT INTO users (email, password, is_admin) VALUES (?, ?, ?)', [email, hashedPassword, false]);
    res.status(201).json({ message: 'User created' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// User login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ userId: user.id, isAdmin: user.is_admin }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, isAdmin: user.is_admin });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin login
router.post('/admin-login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [admins] = await db.execute('SELECT * FROM admin WHERE username = ?', [username]);
    if (admins.length === 0) return res.status(401).json({ error: 'Invalid admin credentials' });
    const admin = admins[0];
    if (admin.password !== 'admin123') return res.status(401).json({ error: 'Invalid admin credentials' });
    const token = jwt.sign({ adminId: admin.id, isAdmin: true }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, isAdmin: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;