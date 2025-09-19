const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const HttpError = require('./utils/httpError');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN ?? '*'}));
app.use(express.json({ limit: '2mb' }));
app.use('/api', routes);

app.use((req, res, next) => {
  next(new HttpError(404, 'Resource not found'));
});

app.use((error, req, res, _next) => {
  if (error instanceof HttpError) {
    res.status(error.status).json({ message: error.message, details: error.details });
    return;
  }
  console.error('Unexpected server error', error);
  res.status(500).json({ message: 'Internal server error' });
});

module.exports = app;
