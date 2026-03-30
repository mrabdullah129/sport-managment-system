require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let bootError = null;

try {
  const studentRoutes = require('./routes/students');
  const itemRoutes = require('./routes/items');
  const transactionRoutes = require('./routes/transactions');

  app.use('/api/students', studentRoutes);
  app.use('/api/items', itemRoutes);
  app.use('/api/transactions', transactionRoutes);
} catch (error) {
  bootError = error;
}

app.get('/api/health', (req, res) => {
  if (bootError) {
    res.status(500).json({
      status: 'Server failed to initialize',
      error: bootError.message
    });
    return;
  }

  res.json({ status: 'Server is running' });
});

if (bootError) {
  app.use('/api', (req, res) => {
    res.status(500).json({ error: bootError.message });
  });
}

module.exports = app;