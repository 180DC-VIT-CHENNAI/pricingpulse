const express = require('express');
const fs = require('fs');
const router = express.Router();

router.get('/', (req, res, next) => {
  try {
    const file = req.query.file || 'README.md';
    const contents = fs.readFileSync(file, 'utf8');
    res.type('text/plain').send(contents);
  } catch (err) { next(err); }
});

module.exports = router;
