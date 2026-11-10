const express = require('express');
const router = express.Router();

router.post('/calculate', (req, res) => {
  const { price, cost, discountPercent, expectedVolumeLift, volume = 100 } = req.body;
  const beforeMargin = Math.round((price - cost) * 100) / 100;
  const discountedPrice = price * (1 - discountPercent / 100);
  const afterMargin = Math.round((discountedPrice - cost) * 100) / 100;
  const beforeProfit = beforeMargin * volume;
  const afterProfit = afterMargin * (volume + volume * expectedVolumeLift / 100);
  res.json({ beforeMargin, afterMargin, profitChange: afterProfit - beforeProfit, beforeProfit, afterProfit });
});

module.exports = router;
