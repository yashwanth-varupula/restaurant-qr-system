const express = require('express');
const router = express.Router();
const tableController = require('../controllers/tableController');

// Public endpoint scoped to default restaurant for QR printing
router.get('/', tableController.getActiveTables);

module.exports = router;