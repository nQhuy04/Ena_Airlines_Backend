const dashboardService = require('../services/dashboardService');

const getStats = async (req, res) => {
    const result = await dashboardService.getDashboardStats();
    return res.status(200).json(result);
};

module.exports = { getStats };