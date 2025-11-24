const Review = require('../models/Review');

const createReview = async (data) => {
    try {
        const newReview = await Review.create(data);
        return { EC: 0, DT: newReview };
    } catch (error) {
        return { EC: -1, EM: 'Lỗi server' };
    }
};

const getReviews = async () => {
    try {
        // Lấy 10 review mới nhất, populate thông tin người dùng để hiện tên và avatar
        const reviews = await Review.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('user', 'name email'); 
        return { EC: 0, DT: reviews };
    } catch (error) {
        return { EC: -1, EM: 'Lỗi server' };
    }
};

module.exports = { createReview, getReviews };