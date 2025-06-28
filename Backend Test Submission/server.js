const express = require('express');
const app = express();
const PORT = 5000;
const shortid = require('shortid');
const cors = require('cors');
const logger = require('./middleware/logger');

app.use(cors());
app.use(express.json());
app.use(logger);

const store = {}; // In-memory database

app.post('/shorturls', (req, res) => {
  const { url, validity = 30, shortcode } = req.body;

  if (!url || typeof validity !== 'number') {
    return res.status(400).json({ error: 'Invalid input: URL and validity must be provided' });
  }

  const code = shortcode || shortid.generate();

  if (store[code]) {
    return res.status(409).json({ error: 'Shortcode already exists' });
  }

  const now = new Date();
  const expiry = new Date(now.getTime() + validity * 60 * 1000);

  store[code] = {
    url,
    created: now,
    expiry,
    clicks: []
  };

  res.status(201).json({
    shortLink: `http://localhost:${PORT}/${code}`,
    expiry: expiry.toISOString()
  });
});

app.get('/shorturls/:code', (req, res) => {
  const code = req.params.code;
  const record = store[code];

  if (!record) {
    return res.status(404).json({ error: 'Shortcode not found' });
  }

  const stats = {
    shortcode: code,
    url: record.url,
    created: record.created,
    expiry: record.expiry,
    clicks: record.clicks,
    totalClicks: record.clicks.length
  };

  res.json(stats);
});

app.get('/:code', (req, res) => {
  const code = req.params.code;
  const record = store[code];

  if (!record) {
    return res.status(404).json({ error: 'Shortcode not found' });
  }

  if (new Date() > new Date(record.expiry)) {
    return res.status(410).json({ error: 'Link expired' });
  }

  record.clicks.push({
    timestamp: new Date(),
    referrer: req.get('Referrer') || 'direct',
    location: req.ip
  });

  res.redirect(record.url);
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
