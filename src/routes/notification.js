// src/routes/notification.js

const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { verifyJWT } = require('../middleware/auth');

// Các API này đều yêu cầu phải đăng nhập (verifyJWT)
router.get('/', verifyJWT, notificationController.getNotifications);
router.put('/read-all', verifyJWT, notificationController.markRead);

module.exports = router;