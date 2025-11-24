// src/routes/crew.js
const express = require('express');
const router = express.Router();
const crewController = require('../controllers/crewController');
const { verifyJWT, requireRole } = require('../middleware/auth');

router.get('/', verifyJWT, requireRole('admin'), crewController.getAllCrew);
router.post('/', verifyJWT, requireRole('admin'), crewController.createCrew);
router.delete('/:id', verifyJWT, requireRole('admin'), crewController.deleteCrew);

module.exports = router;