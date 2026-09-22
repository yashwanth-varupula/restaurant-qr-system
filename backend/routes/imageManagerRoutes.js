const express = require('express');

const router = express.Router();

const imageManagerController = require('../controllers/imageManagerController');
const { authenticateStaff } = require('../middleware/authMiddleware');

// Every image-manager operation requires staff login
router.use(authenticateStaff);

// Get menu items for image management
router.get(
    '/menu-items',
    imageManagerController.getMenuItems
);

// Search Pexels for candidate images
router.get(
    '/search',
    imageManagerController.searchImages
);

// Build an intelligent query and search Pexels for a specific item
router.post(
    '/suggest',
    imageManagerController.suggestImages
);

// Save a selected image URL against a menu item
router.post(
    '/save',
    imageManagerController.saveImage
);

// Upload / replace menu item image
router.post(
    '/upload',
    imageManagerController.upload,
    imageManagerController.uploadImage
);

// Remove menu item image
router.delete(
    '/menu-items/:id',
    imageManagerController.removeImage
);

module.exports = router;