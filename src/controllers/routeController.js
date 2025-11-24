// src/controllers/routeController.js
const routeService = require('../services/routeService');

const createRoute = async (req, res) => {
    const { departureAirport, arrivalAirport, durationMinutes } = req.body;
    // Validation cơ bản
    if (!departureAirport || !arrivalAirport || !durationMinutes) {
        return res.status(400).json({ EC: -1, EM: 'Vui lòng nhập đủ thông tin sân bay đi, đến và thời gian bay.' });
    }
    const result = await routeService.createRoute(req.body);
    return res.status(result.EC === 0 ? 201 : 400).json(result);
};

const getAllRoutes = async (req, res) => {
    const result = await routeService.getAllRoutes();
    return res.status(result.EC === 0 ? 200 : 500).json(result);
};

const updateRoute = async (req, res) => {
    const result = await routeService.updateRoute(req.params.id, req.body);
    return res.status(result.EC === 0 ? 200 : 404).json(result);
};

const deleteRoute = async (req, res) => {
    const result = await routeService.deleteRoute(req.params.id);
    return res.status(result.EC === 0 ? 200 : 404).json(result);
};



module.exports = { 
    createRoute, 
    getAllRoutes, 
    updateRoute, 
    deleteRoute 
};