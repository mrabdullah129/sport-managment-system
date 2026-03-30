require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const studentRoutes = require('./routes/students');
const itemRoutes = require('./routes/items');
const transactionRoutes = require('./routes/transactions');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/students', studentRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/transactions', transactionRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

module.exports = app;