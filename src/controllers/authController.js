// src/controllers/authController.js
const authService = require('../services/authService');

const register = async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ EC: -1, EM: 'Vui lòng nhập đủ thông tin.' });
    }
    const result = await authService.registerUser(req.body);
    return res.status(result.EC === 0 ? 201 : 400).json(result);
};

const login = async (req, res) => {
    const { email, password } = req.body;
     if (!email || !password) {
        return res.status(400).json({ EC: -1, EM: 'Vui lòng nhập đủ thông tin.' });
    }
    const result = await authService.loginUser(email, password);
    return res.status(result.EC === 0 ? 200 : 401).json(result);
};

module.exports = { register, login };