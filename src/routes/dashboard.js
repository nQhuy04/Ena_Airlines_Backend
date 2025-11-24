const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { verifyJWT, requireRole } = require('../middleware/auth');

// Chỉ admin mới xem được
router.get('/stats', verifyJWT, requireRole('admin'), dashboardController.getStats);

module.exports = router;