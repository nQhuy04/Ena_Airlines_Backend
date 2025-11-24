// src/routes/user.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController'); 
const { verifyJWT, requireRole } = require('../middleware/auth');

// GET /api/v1/users - Chỉ Admin mới có quyền
router.get('/', verifyJWT, requireRole('admin'), userController.getAllUsers);

router.put('/:id', verifyJWT, requireRole('admin'), userController.updateUser); 

module.exports = router;