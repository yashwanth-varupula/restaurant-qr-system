const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateStaff } = require('../middleware/authMiddleware');
const { validateOrder } = require('../middleware/validateMiddleware');

// Staff routes (PROTECTED)
// NOTE: Literal paths (/summary, /history) MUST be registered before
// the parametric customer route (/orders/:id) or they get shadowed.
router.get('/summary', authenticateStaff, orderController.getTodaySummary);
router.get('/', authenticateStaff, orderController.getOrders);
router.get('/history', authenticateStaff, orderController.getOrderHistorySummary);
router.put('/:id/status', authenticateStaff, orderController.updateOrderStatus);

// Customer routes (Public, but strictly validated)
router.post('/', validateOrder, orderController.createOrder);
router.get('/:id', orderController.getCustomerOrder);

module.exports = router;