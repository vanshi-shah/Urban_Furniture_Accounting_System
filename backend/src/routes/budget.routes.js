const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budget.controller');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', budgetController.getBudgets);
router.post('/', budgetController.createBudget);
router.put('/:id/confirm', budgetController.confirmBudget);
router.put('/:id/revise', budgetController.reviseBudget);
router.put('/:id/cancel', budgetController.cancelBudget);
router.put('/:id/complete', budgetController.completeBudget);

module.exports = router;
