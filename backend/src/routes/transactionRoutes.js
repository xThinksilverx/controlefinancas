const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const upload = require('../middleware/uploadMiddleware');
const { validateTransaction, validateId, validateUserId } = require('../middleware/validationMiddleware');
const { sanitizeInput, allowFields } = require('../middleware/securityMiddleware');

// Criar transação (com validação e proteção contra Mass Assignment)
router.post('/transactions', 
  upload.single('receipt'),
  sanitizeInput,
  allowFields(['userId', 'type', 'description', 'amount', 'date', 'category']),
  validateTransaction,
  transactionController.createTransaction
);

router.get('/transactions/:userId', 
  validateUserId,
  transactionController.getTransactions
);

router.delete('/transactions/:id', 
  validateId,
  transactionController.deleteTransaction
);

router.get('/stats/:userId', 
  validateUserId,
  transactionController.getStats
);

module.exports = router;