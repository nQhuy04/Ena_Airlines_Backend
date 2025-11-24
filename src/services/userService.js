const User = require('../models/User');

/**
 * Lấy danh sách tất cả người dùng cho admin
 */
const getAllUsers = async () => {
    try {
        // User.find({}, '-password')
        // - Tham số thứ nhất {}: là bộ lọc, để trống nghĩa là lấy tất cả.
        // - Tham số thứ hai '-password': là projection, dấu '-' ở trước có nghĩa là
        //   "loại trừ" trường này ra khỏi kết quả trả về. Đây là bước bảo mật quan trọng.
        // .sort({ createdAt: -1 }): Sắp xếp người dùng mới nhất lên đầu.
        const users = await User.find({}, '-password').sort({ createdAt: -1 });

        return {
            EC: 0, // Error Code = 0, nghĩa là thành công
            EM: 'Lấy danh sách người dùng thành công!', // Error Message
            DT: users // Data
        };
    } catch (error) {
        console.error('Lỗi khi lấy danh sách người dùng:', error);
        return {
            EC: -1,
            EM: 'Lỗi server',
            DT: null
        };
    }
};

// HÀM MỚI: Cập nhật User
const updateUser = async (id, data) => {
    try {
        // Chỉ cho phép cập nhật Role và Name, không cho đổi Email/Pass lung tung
        const { role, name } = data; 
        const user = await User.findByIdAndUpdate(id, { role, name }, { new: true });
        
        return { EC: 0, EM: 'Cập nhật thành công', DT: user };
    } catch (error) {
        return { EC: -1, EM: 'Lỗi server' };
    }
};

module.exports = {
    getAllUsers,
    updateUser
};