const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { verifyJWT } = require('../middleware/auth');

router.get('/', reviewController.getAll); // Ai cũng xem được
router.post('/', verifyJWT, reviewController.create); // Phải đăng nhập mới được review

module.exports = router;