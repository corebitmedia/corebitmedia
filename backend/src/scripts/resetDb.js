// Drops and recreates the database, then re-seeds it — all from Node, using
// the same mysql2 driver already installed for the app itself. This exists
// because the `mysql` command-line client often isn't on PATH on Windows
// (XAMPP/standalone installs don't always add it), so this avoids needing to
// find/install it just to reset local dev data.
//
// Run with: npm run resetdb --prefix backend
require('dotenv').config();
const mysql = require('mysql2/promise');
const { execSync } = require('child_process');

async function main() {
  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
  if (!DB_NAME) {
    console.error('DB_NAME is not set in backend/.env — aborting.');
    process.exit(1);
  }

  console.log(`Connecting to MySQL at ${DB_HOST || 'localhost'}:${DB_PORT || 3306} as ${DB_USER || 'root'}...`);
  const connection = await mysql.createConnection({
    host: DB_HOST || 'localhost',
    port: Number(DB_PORT) || 3306,
    user: DB_USER || 'root',
    password: DB_PASSWORD || ''
  });

  console.log(`Dropping database \`${DB_NAME}\` (if it exists)...`);
  await connection.query(`DROP DATABASE IF EXISTS \`${DB_NAME}\``);
  console.log(`Creating database \`${DB_NAME}\`...`);
  await connection.query(`CREATE DATABASE \`${DB_NAME}\``);
  await connection.end();

  console.log('Database reset. Running seed...\n');
  execSync('node src/scripts/seed.js', { stdio: 'inherit', cwd: __dirname + '/../..' });
}

main().catch((err) => {
  console.error('Failed to reset database:', err.message);
  process.exit(1);
});
