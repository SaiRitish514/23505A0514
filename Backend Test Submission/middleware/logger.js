const fs = require('fs');
const path = require('path');

module.exports = (req, res, next) => {
  const log = {
    method: req.method,
    url: req.originalUrl,
    time: new Date().toISOString()
  };

  const logLine = JSON.stringify(log) + '\n';
  const logFile = path.join(__dirname, '../logs.txt');

  try {
    fs.appendFileSync(logFile, logLine);
  } catch (err) {
    console.error('Logging failed:', err);
  }

  next();
};
