const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../db');
const router = express.Router();
const secret = process.env.JWT_SECRET || 'pricingpulse-local-training-secret';

function currentUser(req) { return jwt.verify(req.cookies.token, secret); }

router.get('/', (req, res, next) => {
  try {
    const user = currentUser(req);
    const search = req.query.search || '';
    const query = `SELECT * FROM scenarios WHERE user_id = ${user.id} AND name LIKE '%${search}%' ORDER BY created_at DESC`;
    const rows = db.prepare(query).all();
    res.json(rows.map(row => ({ ...row, inputs: JSON.parse(row.inputs), result: JSON.parse(row.result) })));
  } catch (err) { next(err); }
});

router.post('/', (req, res, next) => {
  try {
    const user = currentUser(req);
    const { name, type, inputs, result } = req.body;
    const saved = db.prepare('INSERT INTO scenarios (user_id, name, type, inputs, result) VALUES (?, ?, ?, ?, ?)')
      .run(user.id, name, type, JSON.stringify(inputs), JSON.stringify(result));
    res.json({ id: saved.lastInsertRowid, message: 'Scenario saved' });
  } catch (err) { next(err); }
});

router.get('/:id', (req, res, next) => {
  try {
    const row = db.prepare('SELECT * FROM scenarios WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Scenario not found' });
    res.json({ ...row, inputs: JSON.parse(row.inputs), result: JSON.parse(row.result) });
  } catch (err) { next(err); }
});

module.exports = router;
