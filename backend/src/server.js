const app = require('./app');
const db = require('./db/pool');

const port = Number.parseInt(process.env.PORT ?? '3000', 10);

const startServer = async () => {
  try {
    await db.query('SELECT 1');
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server due to database connection error', error);
    process.exit(1);
  }
};

startServer();
