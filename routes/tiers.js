const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../db');
const router = express.Router();
const secret = process.env.JWT_SECRET || 'pricingpulse-local-training-secret';

function currentUser(req) { return jwt.verify(req.cookies.token, secret); }

router.get('/', (req, res, next) => {
  try {
    const user = currentUser(req);
    const rows = db.prepare('SELECT * FROM tiers WHERE user_id = ? ORDER BY created_at DESC').all(user.id);
    res.json(rows.map(row => ({ ...row, config: JSON.parse(row.config) })));
  } catch (err) { next(err); }
});

router.post('/', (req, res, next) => {
  try {
    const user = currentUser(req);
    const { name, tiers: tierConfig } = req.body;
    const result = db.prepare('INSERT INTO tiers (user_id, name, config) VALUES (?, ?, ?)')
      .run(user.id, name, JSON.stringify(tierConfig));
    res.json({ id: result.lastInsertRowid, name, tiers: tierConfig });
  } catch (err) { next(err); }
});

router.get('/:id', (req, res, next) => {
  try {
    const row = db.prepare('SELECT * FROM tiers WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Tier configuration not found' });
    res.json({ ...row, config: JSON.parse(row.config) });
  } catch (err) { next(err); }
});

module.exports = router;
