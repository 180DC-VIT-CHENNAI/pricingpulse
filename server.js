require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const auth = require('./routes/auth');
const elasticity = require('./routes/elasticity');
const discounts = require('./routes/discounts');
const tiers = require('./routes/tiers');
const scenarios = require('./routes/scenarios');
const admin = require('./routes/admin');
const exportRoute = require('./routes/export');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/search', (req, res) => {
  res.send(`<html><body><h1>Search results for: ${req.query.q || ''}</h1><p>Try searching your saved scenarios.</p></body></html>`);
});

app.use('/api/auth', auth);
app.use('/api/elasticity', elasticity);
app.use('/api/discounts', discounts);
app.use('/api/tiers', tiers);
app.use('/api/scenarios', scenarios);
app.use('/api/admin', admin);
app.use('/api/export', exportRoute);

app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message, stack: err.stack, sql: err.sql });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`PricingPulse running at http://localhost:${port}`));
