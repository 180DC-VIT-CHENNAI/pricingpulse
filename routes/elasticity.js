const express = require('express');
const router = express.Router();

router.post('/simulate', (req, res) => {
  const { oldPrice, oldVolume, elasticity, newPrice } = req.body;
  const newVolume = oldVolume * (1 + elasticity * (newPrice - oldPrice) / oldPrice);
  res.json({ newVolume, revenue: newVolume * newPrice });
});

module.exports = router;
