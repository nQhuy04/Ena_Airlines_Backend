// src/seeders/reviewSeeder.js

require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const Review = require('../models/Review');
const User = require('../models/User');
const bcrypt = require('bcrypt');

const fakeUsersData = [
    { name: "Trần Văn Bảo", email: "bao@example.com" },
    { name: "Lê Thị Mai", email: "mai@example.com" },
    { name: "Phạm Hoàng Nam", email: "nam@example.com" },
    { name: "Nguyễn Thu Hà", email: "ha@example.com" },
    { name: "Vũ Đức Thắng", email: "thang@example.com" }
];

const seedReviews = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        // 1. Tạo người dùng giả (nếu chưa có)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('123456', salt);
        
        const fakeUsers = [];
        for (const u of fakeUsersData) {
            // Kiểm tra nếu tồn tại rồi thì lấy, chưa thì tạo mới
            let user = await User.findOne({ email: u.email });
            if (!user) {
                user = await User.create({ ...u, password: hashedPassword, role: 'customer' });
            }
            fakeUsers.push(user);
        }

        // 2. Tạo Review
        const comments = [
            "Dịch vụ rất chuyên nghiệp, tôi sẽ quay lại.",
            "Giá vé rẻ bất ngờ, săn được deal hời quá.",
            "Bay đúng giờ, tiếp viên thân thiện, đáng tiền.",
            "Trải nghiệm đặt vé trên web rất mượt mà.",
            "Thức ăn trên máy bay khá ngon so với các hãng khác."
        ];

        const reviews = comments.map((cmt, index) => ({
            user: fakeUsers[index]._id, // Gắn mỗi review cho 1 user khác nhau
            rating: 5,
            comment: cmt,
        }));

        await Review.deleteMany({}); // Xóa review cũ
        await Review.insertMany(reviews);
        console.log("✅ Đã tạo review mới với nhiều người dùng khác nhau!");
        
    } catch (err) {
        console.error(err);
    } finally {
        mongoose.disconnect();
    }
};

seedReviews();