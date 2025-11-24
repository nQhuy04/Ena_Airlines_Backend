const userService = require('../services/userService');

/**
 * Controller để xử lý yêu cầu lấy tất cả người dùng
 * @param {*} req 
 * @param {*} res 
 */
const getAllUsers = async (req, res) => {
    // 1. Gọi đến service để thực hiện logic
    const result = await userService.getAllUsers();

    // 2. Dựa vào kết quả từ service để trả về response cho client
    //    Nếu result.EC === 0, trả về status 200 (OK)
    //    Nếu khác, trả về status 500 (Internal Server Error)
    return res.status(result.EC === 0 ? 200 : 500).json(result);
};

const updateUser = async (req, res) => {
    const { id } = req.params;
    const result = await userService.updateUser(id, req.body);
    return res.status(200).json(result);
};

module.exports = {
    getAllUsers,
    updateUser
};