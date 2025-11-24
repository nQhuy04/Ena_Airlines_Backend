// src/services/routeService.js
const Route = require('../models/Route');

const createRoute = async (routeData) => {
    try {
        const { departureAirport, arrivalAirport } = routeData;
        // Kiểm tra đường bay đã tồn tại chưa
        const existingRoute = await Route.findOne({ departureAirport, arrivalAirport });
        if (existingRoute) {
            return { EC: 1, EM: 'Đường bay này đã tồn tại.' };
        }
        const newRoute = await Route.create(routeData);
        return { EC: 0, EM: 'Tạo đường bay thành công!', DT: newRoute };
    } catch (error) {
        console.error('Lỗi khi tạo đường bay:', error);
        return { EC: -1, EM: 'Lỗi server' };
    }
};

const getAllRoutes = async () => {
    try {
        // Populate để lấy thông tin chi tiết của sân bay đi và đến
        const routes = await Route.find()
            .populate('departureAirport', 'name iataCode city')
            .populate('arrivalAirport', 'name iataCode city')
            .sort({ createdAt: -1 });
        return { EC: 0, EM: 'Lấy danh sách đường bay thành công!', DT: routes };
    } catch (error) {
        console.error('Lỗi khi lấy danh sách đường bay:', error);
        return { EC: -1, EM: 'Lỗi server' };
    }
};

const updateRoute = async (id, updateData) => {
    try {
        const route = await Route.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        if (!route) return { EC: 1, EM: 'Không tìm thấy đường bay.' };
        return { EC: 0, EM: 'Cập nhật đường bay thành công!', DT: route };
    } catch (error) {
        console.error('Lỗi khi cập nhật đường bay:', error);
        return { EC: -1, EM: 'Lỗi server' };
    }
};

const deleteRoute = async (id) => {
    try {
        const route = await Route.findByIdAndDelete(id);
        if (!route) return { EC: 1, EM: 'Không tìm thấy đường bay.' };
        return { EC: 0, EM: 'Xóa đường bay thành công!', DT: route };
    } catch (error) {
        console.error('Lỗi khi xóa đường bay:', error);
        return { EC: -1, EM: 'Lỗi server' };
    }
};
module.exports = { 
    createRoute, 
    getAllRoutes, 
    updateRoute, 
    deleteRoute 
};
