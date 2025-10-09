const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');

// Proteção contra força bruta
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas
  message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limit geral
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requisições
  message: 'Muitas requisições. Tente novamente mais tarde.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Sanitização de inputs contra XSS
const sanitizeInput = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<[^>]*>/g, '')
          .trim();
      }
    });
  }
  next();
};

const allowFields = (allowedFields) => {
  return (req, res, next) => {
    if (req.body) {
      const filteredBody = {};
      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          filteredBody[field] = req.body[field];
        }
      });
      req.body = filteredBody;
    }
    next();
  };
};

module.exports = {
  helmet,
  xss,
  hpp,
  loginLimiter,
  generalLimiter,
  sanitizeInput,
  allowFields
};