// src/services/aircraftService.js
const Aircraft = require('../models/Aircraft');

const createAircraft = async (aircraftData) => {
    try {
        const { registrationNumber } = aircraftData;
        // Kiểm tra số hiệu máy bay (phải là duy nhất)
        const existingAircraft = await Aircraft.findOne({ registrationNumber });
        if (existingAircraft) {
            return { EC: 1, EM: `Số hiệu máy bay '${registrationNumber}' đã tồn tại.` };
        }
        const newAircraft = await Aircraft.create(aircraftData);
        return { EC: 0, EM: 'Thêm máy bay thành công!', DT: newAircraft };
    } catch (error) {
        console.error('Lỗi khi tạo máy bay:', error);
        return { EC: -1, EM: 'Lỗi server' };
    }
};

const getAllAircrafts = async () => {
    try {
        const aircrafts = await Aircraft.find().sort({ createdAt: -1 });
        return { EC: 0, EM: 'Lấy danh sách máy bay thành công!', DT: aircrafts };
    } catch (error) {
        console.error('Lỗi khi lấy danh sách máy bay:', error);
        return { EC: -1, EM: 'Lỗi server' };
    }
};

const updateAircraft = async (id, updateData) => {
     try {
        const aircraft = await Aircraft.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        if (!aircraft) return { EC: 1, EM: 'Không tìm thấy máy bay.' };
        return { EC: 0, EM: 'Cập nhật máy bay thành công!', DT: aircraft };
    } catch (error) {
        console.error('Lỗi khi cập nhật máy bay:', error);
        return { EC: -1, EM: 'Lỗi server' };
    }
};

const deleteAircraft = async (id) => {
    try {
        const aircraft = await Aircraft.findByIdAndDelete(id);
         if (!aircraft) return { EC: 1, EM: 'Không tìm thấy máy bay.' };
        return { EC: 0, EM: 'Xóa máy bay thành công!', DT: aircraft };
    } catch (error) {
        console.error('Lỗi khi xóa máy bay:', error);
        return { EC: -1, EM: 'Lỗi server' };
    }
};

module.exports = { createAircraft, getAllAircrafts, updateAircraft, deleteAircraft };