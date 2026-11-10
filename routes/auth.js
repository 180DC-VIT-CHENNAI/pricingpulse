const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();
const secret = process.env.JWT_SECRET || 'pricingpulse-local-training-secret';

router.post('/register', (req, res, next) => {
  try {
    const { username, password, role } = req.body;
    const result = db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)')
      .run(username, password, role || 'user');
    res.json({ id: result.lastInsertRowid, username, role: role || 'user' });
  } catch (err) { next(err); }
});

router.post('/login', (req, res, next) => {
  try {
    const { username, password } = req.body;
    const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
    const user = db.prepare(query).get();
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, secret, { expiresIn: '30d' });
    res.cookie('token', token, { maxAge: 30 * 24 * 60 * 60 * 1000 });
    res.json({ message: 'Logged in', user: { id: user.id, username: user.username, role: user.role } });
  } catch (err) { next(err); }
});

router.post('/logout', (req, res) => { res.clearCookie('token'); res.json({ message: 'Logged out' }); });

router.get('/me', (req, res) => {
  try { res.json(jwt.verify(req.cookies.token, secret)); }
  catch (err) { res.status(401).json({ error: 'Not logged in' }); }
});

module.exports = router;
