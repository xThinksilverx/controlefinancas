require('dotenv').config();
const mysql = require('mysql2/promise');

// Validação obrigatória de variáveis de ambiente
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_NAME'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('ERRO: Variáveis de ambiente obrigatórias faltando:', missingVars);
  console.error('Configure o arquivo .env com:', missingVars.join(', '));
  process.exit(1);
}


const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Testar conexão
pool.getConnection()
  .then(connection => {
    console.log('Conectado ao MySQL com sucesso!');
    connection.release();
  })
  .catch(err => {
    console.error('Erro ao conectar ao MySQL:', err.message);
    console.error('Verifique as credenciais no arquivo .env');
    process.exit(1);
  });

module.exports = pool;