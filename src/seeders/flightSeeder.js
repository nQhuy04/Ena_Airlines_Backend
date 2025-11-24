// src/seeders/flightSeeder.js (VERSION FINAL: CÓ CREW)

require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const Flight = require('../models/Flight');
const Airport = require('../models/Airport');
const Aircraft = require('../models/Aircraft');
const CrewMember = require('../models/CrewMember'); // Import thêm Crew

const generateSeats = (seatCapacity) => {
    const seats = [];
    const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
    let rowNumber = 1;
    let seatCount = 0;
    while (seatCount < seatCapacity.business) {
        for (const rowLetter of rows) {
            if (seatCount >= seatCapacity.business) break;
            seats.push({ number: `${rowNumber}${rowLetter}`, class: 'business', status: 'available' });
            seatCount++;
        }
        rowNumber++;
    }
    seatCount = 0;
    while (seatCount < seatCapacity.economy) {
        for (const rowLetter of rows) {
            if (seatCount >= seatCapacity.economy) break;
            seats.push({ number: `${rowNumber}${rowLetter}`, class: 'economy', status: 'available' });
            seatCount++;
        }
        rowNumber++;
    }
    return seats;
};

// Hàm lấy ngẫu nhiên n phần tử từ mảng
const getRandomSubset = (arr, count) => {
    const shuffled = arr.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count).map(i => i._id);
};

const seedFlights = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Kết nối DB thành công.');

        // 1. Lấy dữ liệu nền
        const airports = await Airport.find();
        const aircrafts = await Aircraft.find();
        
        // Lấy danh sách nhân sự
        const allPilots = await CrewMember.find({ role: 'pilot' });
        const allAttendants = await CrewMember.find({ role: 'flight_attendant' });

        if (airports.length < 2 || aircrafts.length === 0) {
            console.log('❌ Thiếu dữ liệu sân bay/máy bay.');
            return;
        }

        await Flight.deleteMany({});
        console.log('🔥 Đã xóa chuyến bay cũ.');

        const newFlights = [];
        let routeCounter = 100;

        for (const dep of airports) {
            for (const arr of airports) {
                if (dep._id.equals(arr._id)) continue;

                const routeFlightNum = `EN${routeCounter++}`;
                const aircraft = aircrafts[Math.floor(Math.random() * aircrafts.length)];
                
                // Generate ghế gốc
                const seatLayout = generateSeats(aircraft.seatCapacity);

                for (let i = 0; i < 15; i++) {
                    // --- Chọn tổ bay cho ngày hôm đó ---
                    // Random 2 Phi công và 3 Tiếp viên cho mỗi chuyến
                    const assignedPilots = getRandomSubset(allPilots, 2);
                    const assignedAttendants = getRandomSubset(allAttendants, 3);

                    // Chuyến 1 (Sáng)
                    let date1 = new Date();
                    date1.setDate(date1.getDate() + i);
                    date1.setHours(7 + Math.floor(Math.random() * 3), 0, 0, 0); // 7h - 10h
                    let duration1 = 60 + Math.floor(Math.random() * 120);
                    let arr1 = new Date(date1.getTime() + duration1 * 60000);

                    newFlights.push({
                        flightNumber: routeFlightNum,
                        departureAirport: dep._id,
                        arrivalAirport: arr._id,
                        aircraft: aircraft._id,
                        departureTime: date1,
                        arrivalTime: arr1,
                        basePrice: {
                            economy: 500000 + Math.floor(Math.random() * 20) * 50000,
                            business: 2000000 + Math.floor(Math.random() * 20) * 100000
                        },
                        status: 'scheduled',
                        seats: [...seatLayout], // Clone mảng ghế mới
                        
                        // GÁN TỔ BAY
                        pilots: assignedPilots,
                        flightAttendants: assignedAttendants
                    });

                    // Chuyến 2 (Chiều)
                    let date2 = new Date();
                    date2.setDate(date2.getDate() + i);
                    date2.setHours(14 + Math.floor(Math.random() * 5), 30, 0, 0); // 14h - 19h
                    let arr2 = new Date(date2.getTime() + duration1 * 60000);

                    newFlights.push({
                        flightNumber: `${routeFlightNum}B`,
                        departureAirport: dep._id,
                        arrivalAirport: arr._id,
                        aircraft: aircraft._id,
                        departureTime: date2,
                        arrivalTime: arr2,
                        basePrice: {
                            economy: 600000 + Math.floor(Math.random() * 20) * 50000,
                            business: 2200000 + Math.floor(Math.random() * 20) * 100000
                        },
                        status: 'scheduled',
                        seats: [...seatLayout],
                        
                        // GÁN TỔ BAY (Random lại cho chuyến chiều cũng được, hoặc dùng lại)
                        pilots: getRandomSubset(allPilots, 2),
                        flightAttendants: getRandomSubset(allAttendants, 3)
                    });
                }
            }
        }

        // Insert theo Chunk để không bị quá tải
        const CHUNK_SIZE = 500;
        console.log(`🚀 Đang tạo ${newFlights.length} chuyến bay (kèm tổ bay)...`);
        for (let i = 0; i < newFlights.length; i += CHUNK_SIZE) {
            const chunk = newFlights.slice(i, i + CHUNK_SIZE);
            await Flight.insertMany(chunk, { ordered: false });
            console.log(`... Đã xử lý ${Math.min(i + CHUNK_SIZE, newFlights.length)}`);
        }

        console.log("✅ DONE! Tất cả chuyến bay đã có Phi công & Tiếp viên.");

    } catch (error) {
        console.error('❌ Lỗi:', error);
    } finally {
        mongoose.disconnect();
    }
};

seedFlights();