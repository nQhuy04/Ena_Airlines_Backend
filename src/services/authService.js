// src/services/authService.js
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const registerUser = async (userData) => {
    try {
        // Kiểm tra xem email đã tồn tại chưa
        const existingUser = await User.findOne({ email: userData.email });
        if (existingUser) {
            return { EC: 1, EM: 'Email đã tồn tại.' };
        }

        const newUser = new User(userData);
        await newUser.save(); // Middleware pre-save sẽ tự động hash mật khẩu
        
        // Không trả về mật khẩu
        newUser.password = undefined; 

        return { EC: 0, EM: 'Đăng ký thành công!', DT: newUser };
    } catch (error) {
        console.error(error);
        return { EC: -1, EM: 'Lỗi server' };
    }
};

const loginUser = async (email, password) => {
    try {
        const user = await User.findOne({ email: email.trim() });
        
        // --- DEBUGGING: Bắt đầu ---
        console.log("--- BẮT ĐẦU DEBUG ĐĂNG NHẬP ---");
        console.log("Email người dùng nhập:", email);
        console.log("Password người dùng nhập:", password);

        if (!user) {
            console.log("KẾT QUẢ: Không tìm thấy user trong DB.");
            console.log("--- KẾT THÚC DEBUG ---");
            return { EC: 1, EM: 'Email hoặc mật khẩu không chính xác.' };
        }
        
        console.log("Password đã mã hóa trong DB:", user.password);
        
        const isMatch = await bcrypt.compare(password, user.password);
        
        console.log("Kết quả so sánh của bcrypt.compare:", isMatch); // Đây là dòng quan trọng nhất
        console.log("--- KẾT THÚC DEBUG ---");
        // --- DEBUGGING: Kết thúc ---

        if (!isMatch) {
            return { EC: 1, EM: 'Email hoặc mật khẩu không chính xác.' };
        }

        // ... phần còn lại của hàm giữ nguyên ...
        const payload = { id: user._id, name: user.name, role: user.role };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
        const userData = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        };
        return { EC: 0, EM: 'Đăng nhập thành công!', DT: { accessToken: token, user: userData } };

    } catch (error) {
        console.error(error);
        return { EC: -1, EM: 'Lỗi server' };
    }
};

module.exports = { registerUser, loginUser };