const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middleware/validationMiddleware');
const { loginLimiter, sanitizeInput, allowFields } = require('../middleware/securityMiddleware');

router.post('/register', 
  sanitizeInput,
  allowFields(['name', 'email', 'password']),
  validateRegister, 
  authController.register
);

router.post('/login', 
  loginLimiter,
  sanitizeInput,
  allowFields(['email', 'password']),
  validateLogin, 
  authController.login
);

module.exports = router;