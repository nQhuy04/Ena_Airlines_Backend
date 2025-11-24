// src/controllers/flightController.js
const flightService = require('../services/flightService');

const createFlight = async (req, res) => {
    const { flightNumber, departureAirport, arrivalAirport, aircraft, departureTime, arrivalTime, basePrice } = req.body;
    if (!flightNumber || !departureAirport || !arrivalAirport || !aircraft || !departureTime || !arrivalTime || !basePrice) {
        return res.status(400).json({ EC: -1, EM: 'Vui lòng cung cấp đủ thông tin chuyến bay.' });
    }
    const result = await flightService.createFlight(req.body);
    return res.status(result.EC === 0 ? 201 : 400).json(result);
};

const getAllFlights = async (req, res) => {
    const result = await flightService.getAllFlights();
    return res.status(result.EC === 0 ? 200 : 500).json(result);
};

const searchFlights = async (req, res) => {
    const result = await flightService.searchFlights(req.query);
    return res.status(result.EC === 0 ? 200 : 500).json(result);
};

const getFlightDetails = async (req, res) => {
    const result = await flightService.getFlightDetails(req.params.id);
    return res.status(result.EC === 0 ? 200 : 404).json(result);
};

const updateFlight = async (req, res) => {
    const result = await flightService.updateFlight(req.params.id, req.body);
    return res.status(result.EC === 0 ? 200 : 404).json(result);
};

const deleteFlight = async (req, res) => {
    const result = await flightService.deleteFlight(req.params.id);
    return res.status(result.EC === 0 ? 200 : 404).json(result);
};

const findCheapestFlights = async (req, res) => {
        const result = await flightService.findCheapestFlights();
        return res.status(result.EC === 0 ? 200 : 500).json(result);
};

module.exports = { 
    createFlight, 
    getAllFlights,
    searchFlights,
    getFlightDetails,
    updateFlight,
    deleteFlight,
    findCheapestFlights
};