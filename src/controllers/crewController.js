// src/controllers/crewController.js
const CrewMember = require('../models/CrewMember');

const getAllCrew = async (req, res) => {
    try {
        // Lấy danh sách và sắp xếp theo mã NV
        const crew = await CrewMember.find().sort({ role: -1, employeeId: 1 });
        return res.status(200).json({ EC: 0, DT: crew });
    } catch (e) {
        return res.status(500).json({ EC: -1, EM: 'Lỗi server' });
    }
};

const createCrew = async (req, res) => {
    try {
        await CrewMember.create(req.body);
        return res.status(200).json({ EC: 0, EM: 'Thêm nhân sự thành công' });
    } catch (e) {
        return res.status(500).json({ EC: -1, EM: 'Lỗi hoặc trùng mã NV' });
    }
};

const deleteCrew = async (req, res) => {
    try {
        await CrewMember.findByIdAndDelete(req.params.id);
        return res.status(200).json({ EC: 0, EM: 'Xóa thành công' });
    } catch (e) {
        return res.status(500).json({ EC: -1 });
    }
};

module.exports = { getAllCrew, createCrew, deleteCrew };