const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,        
  port: process.env.DB_PORT,        
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
});
console.log("🔍 ENV:", {
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
  DB_PORT: process.env.DB_PORT,
  DB_SSL: process.env.DB_SSL
});
db.connect((err) => {
  if (err) {
    console.error('❌ Error de conexión a MySQL:', err.message);
    process.exit(1);
  }
  console.log('📦 Conectado a la base de datos MySQL');
});

module.exports = db;
