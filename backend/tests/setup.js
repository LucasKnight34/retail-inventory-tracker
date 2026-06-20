const path = require('path');
const fs = require('fs');

process.env.NODE_ENV = 'test';
if (process.env.TEST_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
}
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-secret-key';
}

const db = require('../src/db');

const schema = fs.readFileSync(
  path.join(__dirname, '../src/db/schema.sql'),
  'utf-8'
);

const createTables = async () => {
  await db.query(schema);
};

const dropTables = async () => {
  await db.query(`
    DROP TRIGGER IF EXISTS set_updated_at ON products;
    DROP FUNCTION IF EXISTS update_updated_at;
    DROP TABLE IF EXISTS products CASCADE;
    DROP TABLE IF EXISTS categories CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
  `);
};

const closeDb = async () => {
  await db.end();
};

module.exports = { db, createTables, dropTables, closeDb };
