const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');

// Public routes for customers
router.get('/', menuController.getFullMenu);
router.get('/:id', menuController.getMenuItemById);

module.exports = router;