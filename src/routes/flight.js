// src/routes/flight.js

const express = require('express');
const router = express.Router();
const flightController = require('../controllers/flightController'); 
const { verifyJWT, requireRole } = require('../middleware/auth');

// === PUBLIC ROUTES (AI CŨNG DÙNG ĐƯỢC) ===

// 1. Route Search (Cụ thể)
router.get('/search', flightController.searchFlights);

// 2. Route Cheapest (Cụ thể) - ĐẶT LÊN TRÊN /:id
router.get('/cheapest', flightController.findCheapestFlights); 

// 3. Route Chi tiết theo ID (Chung chung) - PHẢI ĐẶT CUỐI CÙNG TRONG NHÓM GET
router.get('/:id', flightController.getFlightDetails);


// === ADMIN ROUTES (CẦN QUYỀN) ===
router.get('/', verifyJWT, requireRole('admin'), flightController.getAllFlights);
router.post('/', verifyJWT, requireRole('admin'), flightController.createFlight);
router.put('/:id', verifyJWT, requireRole('admin'), flightController.updateFlight);
router.delete('/:id', verifyJWT, requireRole('admin'), flightController.deleteFlight);

module.exports = router;