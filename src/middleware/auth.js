// src/middleware/auth.js
const jwt = require('jsonwebtoken');

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ EC: -1, EM: 'Token không hợp lệ hoặc không được cung cấp.' });
    }
    
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            // Token hết hạn hoặc không đúng
            return res.status(403).json({ EC: -1, EM: 'Token không hợp lệ.' });
        }
        
        // Lưu thông tin user đã được giải mã vào request để các hàm sau có thể dùng
        req.user = decoded; 
        next(); // Cho phép đi tiếp
    });
};

// Middleware này nhận vào một mảng các vai trò được phép
const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            // Nếu user không có hoặc vai trò không nằm trong danh sách cho phép
            return res.status(403).json({ EC: -1, EM: 'Bạn không có quyền truy cập tài nguyên này.' });
        }
        next(); // Vai trò hợp lệ, cho đi tiếp
    };
};

module.exports = { verifyJWT, requireRole };