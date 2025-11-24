// src/controllers/airportController.js
const airportService = require('../services/airportService');

const createAirport = async (req, res) => {
    const { name, iataCode, city, country } = req.body;
    if (!name || !iataCode || !city || !country) {
        return res.status(400).json({ EC: -1, EM: 'Vui lòng nhập đủ thông tin.' });
    }
    const result = await airportService.createAirport(req.body);
    return res.status(result.EC === 0 ? 201 : 400).json(result);
};

const getAllAirports = async (req, res) => {
    const result = await airportService.getAllAirports();
    return res.status(result.EC === 0 ? 200 : 500).json(result);
};

const updateAirport = async (req, res) => {
    const result = await airportService.updateAirport(req.params.id, req.body);
    return res.status(result.EC === 0 ? 200 : 404).json(result);
};

const deleteAirport = async (req, res) => {
     const result = await airportService.deleteAirport(req.params.id);
     return res.status(result.EC === 0 ? 200 : 404).json(result);
};

module.exports = {
    createAirport,
    getAllAirports,
    updateAirport,
    deleteAirport
};