/**
 * Creates DATABASE_NAME from .env if it does not exist (MySQL must be running).
 * Run from backend: npm run db:create
 */
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

function loadEnv(filePath) {
  const out = {};
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing ${filePath}`);
  }
  const text = fs.readFileSync(filePath, 'utf8');
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

async function main() {
  const envPath = path.join(__dirname, '..', '.env');
  const env = loadEnv(envPath);
  if (env.DATABASE_CLIENT !== 'mysql') {
    console.log('DATABASE_CLIENT is not mysql; nothing to do.');
    process.exit(0);
  }
  const host = env.DATABASE_HOST || '127.0.0.1';
  const port = Number(env.DATABASE_PORT || 3306);
  const user = env.DATABASE_USERNAME;
  const password = env.DATABASE_PASSWORD ?? '';
  const database = env.DATABASE_NAME;
  if (!user || !database) {
    throw new Error('.env needs DATABASE_USERNAME and DATABASE_NAME');
  }

  const conn = await mysql.createConnection({
    host,
    port,
    user,
    password,
    multipleStatements: false,
  });

  const safeName = database.replace(/[^a-zA-Z0-9_]/g, '');
  if (safeName !== database) {
    await conn.end();
    throw new Error('DATABASE_NAME may only contain letters, numbers, and underscores.');
  }

  await conn.query(
    `CREATE DATABASE IF NOT EXISTS \`${safeName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await conn.end();
  console.log(`MySQL database "${safeName}" is ready (created if it was missing).`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
