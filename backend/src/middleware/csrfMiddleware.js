const crypto = require('crypto');

// Armazenamento de tokens em memória
const tokenStore = new Map();

// Gerar token CSRF
const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Middleware para gerar e enviar token CSRF
const csrfToken = (req, res, next) => {
  const token = generateToken();
  const sessionId = req.headers['x-session-id'] || req.ip;
  
  // Armazenar token com timestamp
  tokenStore.set(sessionId, {
    token,
    createdAt: Date.now()
  });
  
  // Limpar tokens antigos (mais de 1 hora)
  for (const [key, value] of tokenStore.entries()) {
    if (Date.now() - value.createdAt > 3600000) {
      tokenStore.delete(key);
    }
  }
  
  res.locals.csrfToken = token;
  next();
};

// Middleware para validar token CSRF
const verifyCsrfToken = (req, res, next) => {
  // Métodos que não precisam de CSRF
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  const sessionId = req.headers['x-session-id'] || req.ip;
  const tokenFromRequest = req.headers['x-csrf-token'] || req.body._csrf;
  
  const storedTokenData = tokenStore.get(sessionId);
  
  if (!storedTokenData) {
    return res.status(403).json({ 
      error: 'Token CSRF não encontrado. Faça login novamente.' 
    });
  }
  
  if (!tokenFromRequest || tokenFromRequest !== storedTokenData.token) {
    return res.status(403).json({ 
      error: 'Token CSRF inválido. Ação bloqueada por segurança.' 
    });
  }
  
  // Token válido - gerar novo token para próxima requisição
  const newToken = generateToken();
  tokenStore.set(sessionId, {
    token: newToken,
    createdAt: Date.now()
  });
  
  res.locals.csrfToken = newToken;
  next();
};

module.exports = {
  csrfToken,
  verifyCsrfToken
};