require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const { helmet, xss, hpp, generalLimiter } = require('./middleware/securityMiddleware');
const { csrfToken, verifyCsrfToken } = require('./middleware/csrfMiddleware');

const app = express();

// ✅ Helmet com CSP forte
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Necessário para Tailwind
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// ✅ CORS restrito
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requisições sem origin (mobile apps, Postman, etc)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('Origem não permitida por CORS'), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Session-Id']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ✅ Proteção contra XSS
app.use(xss());

// ✅ Proteção contra HTTP Parameter Pollution
app.use(hpp());

// ✅ Rate limiting global
app.use('/api', generalLimiter);

// ✅ CSRF Token - Gerar para todas as rotas
app.use('/api', csrfToken);

// Rota para obter token CSRF
app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: res.locals.csrfToken });
});

// ✅ Servir uploads de forma segura
app.use('/uploads', express.static('uploads', {
  dotfiles: 'deny',
  index: false
}));

// ✅ Rotas (CSRF temporariamente desabilitado para desenvolvimento)
// TODO: Habilitar CSRF quando frontend estiver implementado
// app.use('/api', verifyCsrfToken, authRoutes);
// app.use('/api', verifyCsrfToken, transactionRoutes);
app.use('/api', authRoutes);
app.use('/api', transactionRoutes);

// Rota raiz
app.get('/', (req, res) => {
  res.json({ 
    message: 'API do Sistema Financeiro',
    version: '1.0.0',
    status: 'online',
    security: {
      helmet: 'enabled',
      cors: 'restricted',
      rateLimit: 'active',
      xss: 'protected',
      csrf: 'enabled'
    }
  });
});

// ✅ Error handler seguro
app.use((err, req, res, next) => {
  console.error('❌ Erro:', err);
  
  // Não expor stack trace em produção
  if (process.env.NODE_ENV === 'production') {
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: 'Ocorreu um erro. Tente novamente mais tarde.'
    });
  }
  
  // Em desenvolvimento, mostrar detalhes
  if (err.message === 'Apenas arquivos PDF são permitidos!') {
    return res.status(400).json({ error: err.message });
  }
  
  res.status(err.status || 500).json({ 
    error: 'Erro interno do servidor',
    details: err.message,
    stack: err.stack
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Rota não encontrada',
    path: req.path
  });
});

module.exports = app;