// src/routes/airport.js
const express = require('express');
const router = express.Router();
const airportController = require('../controllers/airportController'); 
const { verifyJWT, requireRole } = require('../middleware/auth');

// PUBLIC - Bất kỳ ai cũng có thể gọi
router.get('/', airportController.getAllAirports);

// ADMIN
router.post('/', verifyJWT, requireRole('admin'), airportController.createAirport);
router.put('/:id', verifyJWT, requireRole('admin'), airportController.updateAirport);
router.delete('/:id', verifyJWT, requireRole('admin'), airportController.deleteAirport);

module.exports = router;