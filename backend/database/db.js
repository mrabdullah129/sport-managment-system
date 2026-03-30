const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const defaultDbPath = process.env.VERCEL
  ? path.join('/tmp', 'sports_management.db')
  : path.join(__dirname, 'sports_management.db');

const dbPath = process.env.DATABASE_PATH || defaultDbPath;

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Ensure schema exists in local and serverless environments.
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      roll_no TEXT UNIQUE NOT NULL,
      class TEXT NOT NULL,
      phone TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      total_quantity INTEGER NOT NULL,
      available_quantity INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      item_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      issue_date DATETIME NOT NULL,
      return_date DATETIME,
      status TEXT DEFAULT 'issued',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id),
      FOREIGN KEY (item_id) REFERENCES items(id)
    )
  `);
});

module.exports = db;
