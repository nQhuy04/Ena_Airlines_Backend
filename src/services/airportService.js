// src/services/airportService.js
const Airport = require('../models/Airport');

// Tạo sân bay mới
const createAirport = async (airportData) => {
    try {
        // Kiểm tra mã sân bay đã tồn tại chưa
        const existingAirport = await Airport.findOne({ iataCode: airportData.iataCode });
        if (existingAirport) {
            return { EC: 1, EM: `Mã sân bay '${airportData.iataCode}' đã tồn tại.` };
        }
        const newAirport = await Airport.create(airportData);
        return { EC: 0, EM: 'Tạo sân bay thành công!', DT: newAirport };
    } catch (error) {
        console.error('Lỗi khi tạo sân bay:', error);
        return { EC: -1, EM: 'Lỗi server' };
    }
};

// Lấy tất cả sân bay
const getAllAirports = async () => {
    try {
        const airports = await Airport.find().sort({ name: 1 }); // Sắp xếp theo tên
        return { EC: 0, EM: 'Lấy danh sách sân bay thành công!', DT: airports };
    } catch (error) {
        console.error('Lỗi khi lấy danh sách sân bay:', error);
        return { EC: -1, EM: 'Lỗi server' };
    }
};

// Cập nhật sân bay
const updateAirport = async (airportId, updateData) => {
     try {
        const airport = await Airport.findByIdAndUpdate(airportId, updateData, { new: true, runValidators: true });
        if (!airport) {
             return { EC: 1, EM: 'Không tìm thấy sân bay.' };
        }
        return { EC: 0, EM: 'Cập nhật sân bay thành công!', DT: airport };
    } catch (error) {
        console.error('Lỗi khi cập nhật sân bay:', error);
        return { EC: -1, EM: 'Lỗi server' };
    }
};

// Xóa sân bay
const deleteAirport = async (airportId) => {
    try {
        const airport = await Airport.findByIdAndDelete(airportId);
         if (!airport) {
             return { EC: 1, EM: 'Không tìm thấy sân bay.' };
        }
        return { EC: 0, EM: 'Xóa sân bay thành công!', DT: airport };
    } catch (error) {
        console.error('Lỗi khi xóa sân bay:', error);
        return { EC: -1, EM: 'Lỗi server' };
    }
};

module.exports = {
    createAirport,
    getAllAirports,
    updateAirport,
    deleteAirport
    // (Chúng ta sẽ thêm getAirportById sau nếu cần)
};