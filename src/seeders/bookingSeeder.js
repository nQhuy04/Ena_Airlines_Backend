// src/seeders/bookingSeeder.js

require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const Flight = require('../models/Flight');
const Booking = require('../models/Booking');
const bcrypt = require('bcrypt');

const fakeUsersNames = [
    "Tran Van Thanh", "Le Thi Buoi", "Pham Nhat Vuong", "Nguyen Phuong Hang", 
    "Elon Musk", "Taylor Swift", "Lionel Messi", "Son Tung MTP", 
    "Black Widow", "Captain America", "Harry Potter", "Naruto Uzumaki"
];

const seedBookings = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Kết nối DB...');

        // 1. Tạo Users ảo (Customer)
        console.log('Creating fake customers...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('123456', salt);
        
        const customerIds = [];
        
        for (const name of fakeUsersNames) {
            const email = name.toLowerCase().replace(/ /g, '') + '@fakemail.com';
            let user = await User.findOne({ email });
            if (!user) {
                user = await User.create({ name, email, password: hashedPassword, role: 'customer' });
            }
            customerIds.push(user._id);
        }

        // 2. Tạo Bookings ngẫu nhiên cho các chuyến bay
        // Chỉ lấy khoảng 1000 chuyến bay đầu tiên để seed cho nhanh, không cần seed hết 4000 chuyến
        const flights = await Flight.find().limit(500); 
        const newBookings = [];
        const flightUpdates = [];

        console.log(`⚡ Đang giả lập khách đặt vé trên ${flights.length} chuyến bay...`);

        for (const flight of flights) {
            // Tỉ lệ đặt chỗ ngẫu nhiên (30% - 80% số chuyến bay sẽ có khách đặt)
            if (Math.random() > 0.3) {
                // Số lượng booking trên chuyến này (1 - 5 đơn)
                const numBookings = Math.floor(Math.random() * 5) + 1;

                for (let i = 0; i < numBookings; i++) {
                    // Chọn random user
                    const userId = customerIds[Math.floor(Math.random() * customerIds.length)];
                    
                    // Chọn số lượng ghế cho đơn này (1-4 ghế)
                    const numSeats = Math.floor(Math.random() * 4) + 1;
                    
                    // Tìm ghế trống
                    const availableSeats = flight.seats.filter(s => s.status === 'available');
                    if (availableSeats.length < numSeats) break;

                    // Lấy ngẫu nhiên ghế từ ghế trống
                    const selectedSeats = availableSeats.slice(0, numSeats);
                    
                    // Update trạng thái ghế trong object flight (để lưu lại sau)
                    const bookedSeatNumbers = [];
                    let bookingTotal = 0;

                    selectedSeats.forEach(s => {
                        s.status = 'booked';
                        s.bookingId = new mongoose.Types.ObjectId(); // Fake ID tạm để giữ chỗ
                        bookedSeatNumbers.push({ seatNumber: s.number });
                        bookingTotal += flight.basePrice[s.class];
                    });

                    // Tạo Booking record
                    newBookings.push({
                        _id: selectedSeats[0].bookingId, // Gắn ID cho khớp logic
                        bookingCode: 'BK' + Math.random().toString(36).substring(2, 8).toUpperCase(),
                        user: userId,
                        flight: flight._id,
                        passengers: selectedSeats.map(s => ({ fullName: "Fake Passenger" })),
                        bookedSeats: bookedSeatNumbers,
                        totalAmount: bookingTotal,
                        status: Math.random() > 0.2 ? 'confirmed' : 'pending' // 80% là đã thanh toán
                    });
                }
                
                // Đẩy chuyến bay đã update ghế vào mảng cần save
                flightUpdates.push(flight.save());
            }
        }

        // 3. Thực thi lưu dữ liệu
        console.log(`📝 Đang lưu ${newBookings.length} đơn đặt vé...`);
        await Booking.insertMany(newBookings);
        
        console.log(`✈️ Đang cập nhật trạng thái ghế cho ${flightUpdates.length} chuyến bay... (Hơi lâu chút nhé)`);
        await Promise.all(flightUpdates);

        console.log("✅ DONE! Hệ thống bây giờ nhìn như thật!");

    } catch (err) {
        console.error(err);
    } finally {
        mongoose.disconnect();
    }
};

seedBookings();