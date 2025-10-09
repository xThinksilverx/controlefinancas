
require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'banco_padaria',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection()
  .then(connection => {
    console.log('Conectado ao MySQL!');
    connection.release();
  })
  .catch(err => {
    console.error('Erro ao conectar ao MySQL:', err);
    process.exit(1);
  });

module.exports = pool;