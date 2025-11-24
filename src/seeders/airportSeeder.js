// src/seeders/airportSeeder.js

require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const Airport = require('../models/Airport');

const airportsData = [
  { name: 'Sân bay Quốc tế Nội Bài', iataCode: 'HAN', city: 'Hà Nội', country: 'Việt Nam' },
  { name: 'Sân bay Quốc tế Tân Sơn Nhất', iataCode: 'SGN', city: 'TP. Hồ Chí Minh', country: 'Việt Nam' },
  { name: 'Sân bay Quốc tế Đà Nẵng', iataCode: 'DAD', city: 'Đà Nẵng', country: 'Việt Nam' },
  { name: 'Sân bay Quốc tế Cam Ranh', iataCode: 'CXR', city: 'Nha Trang', country: 'Việt Nam' },
  { name: 'Sân bay Quốc tế Phú Quốc', iataCode: 'PQC', city: 'Phú Quốc', country: 'Việt Nam' },
  { name: 'Sân bay Quốc tế Cát Bi', iataCode: 'HPH', city: 'Hải Phòng', country: 'Việt Nam' },
  { name: 'Sân bay Quốc tế Phú Bài', iataCode: 'HUI', city: 'Huế', country: 'Việt Nam' },
  { name: 'Sân bay Quốc tế Vinh', iataCode: 'VII', city: 'Vinh', country: 'Việt Nam' },
  { name: 'Sân bay Phù Cát', iataCode: 'UIH', city: 'Quy Nhơn', country: 'Việt Nam' },
  { name: 'Sân bay Côn Đảo', iataCode: 'VCS', city: 'Côn Đảo', country: 'Việt Nam' },
  { name: 'Sân bay Pleiku', iataCode: 'PXU', city: 'Pleiku', country: 'Việt Nam' },
  { name: 'Sân bay Buôn Ma Thuột', iataCode: 'BMV', city: 'Buôn Ma Thuột', country: 'Việt Nam' },
  { name: 'Sân bay Liên Khương', iataCode: 'DLI', city: 'Đà Lạt', country: 'Việt Nam' }
];

const seedAirports = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Kết nối database thành công để seed dữ liệu sân bay.');

        await Airport.deleteMany({});
        console.log('🔥 Xóa tất cả các sân bay cũ thành công.');

        await Airport.insertMany(airportsData);
        console.log(`🌍 Đã tạo thành công ${airportsData.length} sân bay mới!`);

    } catch (error) {
        console.error('❌ Đã xảy ra lỗi khi seed dữ liệu sân bay:', error);
    } finally {
        mongoose.disconnect();
        console.log('🔌 Đã ngắt kết nối database.');
    }
};

seedAirports();