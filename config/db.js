const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : false,
});

db.connect((err) => {
  if (err) {
    console.error('❌ Error de conexión a MySQL:', err.message);
    process.exit(1);
  }
  console.log('📦 Conectado a la base de datos MySQL');
});

module.exports = db;
