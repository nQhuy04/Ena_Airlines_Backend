const reviewService = require('../services/reviewService');

const create = async (req, res) => {
    const { rating, comment } = req.body;
    const userId = req.user.id;
    const result = await reviewService.createReview({ user: userId, rating, comment });
    return res.status(200).json(result);
};

const getAll = async (req, res) => {
    const result = await reviewService.getReviews();
    return res.status(200).json(result);
};

module.exports = { create, getAll };