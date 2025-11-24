// src/routes/aircraft.js
const express = require('express');
const router = express.Router();
const aircraftController = require('../controllers/aircraftController'); 
const { verifyJWT, requireRole } = require('../middleware/auth');

// PUBLIC - Ai cũng có thể xem danh sách máy bay
router.get('/', aircraftController.getAllAircrafts);

// ADMIN - Chỉ admin mới có quyền Thêm, Sửa, Xóa
router.post('/', verifyJWT, requireRole('admin'), aircraftController.createAircraft);
router.put('/:id', verifyJWT, requireRole('admin'), aircraftController.updateAircraft);
router.delete('/:id', verifyJWT, requireRole('admin'), aircraftController.deleteAircraft);

module.exports = router;