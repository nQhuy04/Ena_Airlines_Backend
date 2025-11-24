// src/routes/index.js
const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const airportRoutes = require('./airport'); 
const aircraftRoutes = require('./aircraft');
const routeRoutes = require('./flightRoute'); 
const flightRoutes = require('./flight');
const bookingRoutes = require('./booking');
const userRoutes = require('./user'); 
const notificationRoutes = require('./notification');
const reviewRoutes = require('./review'); 
const dashboardRoutes = require('./dashboard');
const crewRoutes = require('./crew');

router.use('/auth', authRoutes);
router.use('/airports', airportRoutes);
router.use('/aircrafts', aircraftRoutes);
router.use('/routes', routeRoutes);
router.use('/flights', flightRoutes);
router.use('/bookings', bookingRoutes);
router.use('/users', userRoutes); 
router.use('/notifications', notificationRoutes);
router.use('/reviews', reviewRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/crew', crewRoutes);


module.exports = router;
