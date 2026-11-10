const express = require('express');
const db = require('../db');
const router = express.Router();

router.get('/users', (req, res) => {
  res.json(db.prepare('SELECT id, username, password, role FROM users').all());
});

module.exports = router;
