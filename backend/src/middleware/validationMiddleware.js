const { body, param, validationResult } = require('express-validator');
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Dados inválidos',
      details: errors.array() 
    });
  }
  next();
};

// Validações para registro
const validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage('Nome é obrigatório')
    .isLength({ min: 3, max: 100 }).withMessage('Nome deve ter entre 3 e 100 caracteres')
    .escape(),
  body('email')
    .trim()
    .notEmpty().withMessage('Email é obrigatório')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail()
    .isLength({ max: 100 }).withMessage('Email muito longo'),
  body('password')
    .notEmpty().withMessage('Senha é obrigatória')
    .isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Senha deve conter maiúsculas, minúsculas e números'),
  validate
];

// Validações para login
const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email é obrigatório')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Senha é obrigatória'),
  validate
];

// Validações para transação
const validateTransaction = [
  body('userId')
    .notEmpty().withMessage('ID do usuário é obrigatório')
    .isInt().withMessage('ID do usuário inválido'),
  body('type')
    .notEmpty().withMessage('Tipo é obrigatório')
    .isIn(['receita', 'despesa']).withMessage('Tipo deve ser receita ou despesa'),
  body('description')
    .trim()
    .notEmpty().withMessage('Descrição é obrigatória')
    .isLength({ min: 3, max: 255 }).withMessage('Descrição deve ter entre 3 e 255 caracteres')
    .escape(),
  body('amount')
    .notEmpty().withMessage('Valor é obrigatório')
    .isFloat({ min: 0.01 }).withMessage('Valor deve ser maior que zero'),
  body('category')
    .trim()
    .notEmpty().withMessage('Categoria é obrigatória')
    .isLength({ max: 50 }).withMessage('Categoria muito longa')
    .escape(),
  body('date')
    .notEmpty().withMessage('Data é obrigatória')
    .isISO8601().withMessage('Data inválida'),
  validate
];

// Validação de ID
const validateId = [
  param('id')
    .isInt().withMessage('ID inválido'),
  validate
];

const validateUserId = [
  param('userId')
    .isInt().withMessage('ID do usuário inválido'),
  validate
];

module.exports = {
  validateRegister,
  validateLogin,
  validateTransaction,
  validateId,
  validateUserId
};