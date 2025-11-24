// src/controllers/aircraftController.js
const aircraftService = require('../services/aircraftService');

const createAircraft = async (req, res) => {
    const { model, registrationNumber, seatCapacity } = req.body;
    // Thêm validation chặt chẽ hơn
    if (!model || !registrationNumber || !seatCapacity || !seatCapacity.economy || !seatCapacity.business) {
        return res.status(400).json({ EC: -1, EM: 'Vui lòng nhập đủ thông tin model, registrationNumber, và seatCapacity (economy, business).' });
    }
    const result = await aircraftService.createAircraft(req.body);
    return res.status(result.EC === 0 ? 201 : 400).json(result);
};

const getAllAircrafts = async (req, res) => {
    const result = await aircraftService.getAllAircrafts();
    return res.status(result.EC === 0 ? 200 : 500).json(result);
};

const updateAircraft = async (req, res) => {
    const result = await aircraftService.updateAircraft(req.params.id, req.body);
    return res.status(result.EC === 0 ? 200 : 404).json(result);
};

const deleteAircraft = async (req, res) => {
     const result = await aircraftService.deleteAircraft(req.params.id);
     return res.status(result.EC === 0 ? 200 : 404).json(result);
};

module.exports = { createAircraft, getAllAircrafts, updateAircraft, deleteAircraft };