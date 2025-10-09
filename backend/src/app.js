require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const { helmet, xss, hpp, generalLimiter } = require('./middleware/securityMiddleware');

const app = express();

// Como diabos isso funciona? Alguem tira esse comentario antes de colocar no github por favor
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configurado (previne CSRF de outras origens)
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Proteção contra XSS
app.use(xss());

// Proteção contra HTTP Parameter Pollution
app.use(hpp());

app.use('/api', generalLimiter);
app.use('/uploads', express.static('uploads'));
app.use('/api', authRoutes);
app.use('/api', transactionRoutes);
app.get('/', (req, res) => {
  res.json({ 
    message: 'API do Sistema Financeiro está rodando!',
    version: '1.0.0',
  });
});

// Middleware de erro global
app.use((err, req, res, next) => {
  console.error('Erro:', err);
  
  // Não expor detalhes do erro em produção
  if (process.env.NODE_ENV === 'production') {
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
  
  if (err.message === 'Apenas arquivos PDF são permitidos!') {
    return res.status(400).json({ error: err.message });
  }
  
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    details: err.message 
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

module.exports = app;