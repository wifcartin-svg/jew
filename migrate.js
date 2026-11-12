const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const dataDir = path.join(__dirname, 'data');
fs.mkdirSync(dataDir, { recursive: true });
const db = new DatabaseSync(path.join(dataDir, 'jemiki.sqlite'));
db.exec(fs.readFileSync(path.join(__dirname, 'migrations', '001_initial.sql'), 'utf8'));
db.close();
console.log('JEMIKI database schema is ready.');
