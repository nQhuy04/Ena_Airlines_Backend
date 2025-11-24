// src/routes/flightRoute.js
const express = require('express');
const router = express.Router();
const routeController = require('../controllers/routeController'); 
const { verifyJWT, requireRole } = require('../middleware/auth');

// PUBLIC - Ai cũng có thể xem các đường bay
router.get('/', routeController.getAllRoutes);

// ADMIN - Chỉ admin mới có quyền Thêm, Sửa, Xóa
router.post('/', verifyJWT, requireRole('admin'), routeController.createRoute);
router.put('/:id', verifyJWT, requireRole('admin'), routeController.updateRoute);
router.delete('/:id', verifyJWT, requireRole('admin'), routeController.deleteRoute);

module.exports = router;