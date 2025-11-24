// src/services/flightService.js (FINAL VERSION - FULL FEATURES)

const Flight = require('../models/Flight');
const Airport = require('../models/Airport'); 
const Aircraft = require('../models/Aircraft');

// --- Hàm tiện ích: Tạo sơ đồ ghế ---
const generateSeats = (seatCapacity) => {
    const seats = [];
    const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
    let rowNumber = 1;
    let seatCount = 0;

    // 1. Hạng thương gia
    seatCount = 0;
    while (seatCount < seatCapacity.business) {
        for (const rowLetter of rows) {
            if (seatCount < seatCapacity.business) {
                seats.push({ number: `${rowNumber}${rowLetter}`, class: 'business' });
                seatCount++;
            } else break;
        }
        rowNumber++;
    }

    // 2. Hạng phổ thông
    seatCount = 0;
    while (seatCount < seatCapacity.economy) {
        for (const rowLetter of rows) {
            if (seatCount < seatCapacity.economy) {
                seats.push({ number: `${rowNumber}${rowLetter}`, class: 'economy' });
                seatCount++;
            } else break;
        }
        rowNumber++;
    }
    return seats;
};

// --- 1. Tạo chuyến bay mới ---
const createFlight = async (data) => {
    try {
        const { aircraft } = data;
        const plane = await Aircraft.findById(aircraft);
        if (!plane) return { EC: 1, EM: 'Không tìm thấy máy bay.' };
        
        const seats = generateSeats(plane.seatCapacity);
        const newFlight = await Flight.create({ ...data, seats });
        return { EC: 0, DT: newFlight };
    } catch (error) { 
        if (error.code === 11000) return { EC: 2, EM: 'Số hiệu chuyến bay bị trùng.' };
        return { EC: -1, EM: 'Lỗi server' }; 
    }
};

// --- 2. Lấy tất cả chuyến bay (Admin) ---
const getAllFlights = async () => {
     try {
        const flights = await Flight.find()
            .populate('departureAirport', 'iataCode city')
            .populate('arrivalAirport', 'iataCode city')
            .populate('aircraft', 'model registrationNumber')
            // Populate thêm tổ bay để Admin xem
            .populate('pilots', 'name rank avatar')
            .populate('flightAttendants', 'name rank avatar')
            .sort({ departureTime: 1 })
            .limit(100);
        return { EC: 0, EM: 'OK', DT: flights };
    } catch (error) { return { EC: -1, EM: 'Lỗi server' }; }
};

// --- 3. Tìm kiếm chuyến bay (Khách hàng) ---
const searchFlights = async (queryParams) => {
     try {
        const { from, to, date } = queryParams;
        // Bỏ bắt buộc date, nhưng bắt buộc from/to
        if (!from || !to) return { EC: 1, EM: 'Thiếu thông tin điểm đi/đến' };
        
        const filter = { departureAirport: from, arrivalAirport: to };
        
        // Nếu có ngày thì lọc theo ngày, không thì lấy tất cả tương lai
        if (date) {
            const start = new Date(date); start.setUTCHours(0,0,0,0);
            const end = new Date(date); end.setUTCHours(23,59,59,999);
            filter.departureTime = { $gte: start, $lte: end };
        } else {
            filter.departureTime = { $gte: new Date() };
        }
        
        const flights = await Flight.find(filter)
            .populate('departureAirport', 'name iataCode city')
            .populate('arrivalAirport', 'name iataCode city')
            .populate('aircraft', 'model')
            .sort({ departureTime: 1 })
            .lean();
            
        // Tính toán số ghế trống để hiển thị Progress Bar
        const flightsWithSeatInfo = flights.map(f => ({
            ...f,
            seatInfo: { 
                total: f.seats.length, 
                booked: f.seats.filter(s => s.status === 'booked').length 
            }
        }));

        return { EC: 0, EM: 'OK', DT: flightsWithSeatInfo };
    } catch (error) { return { EC: -1, EM: 'Lỗi server' }; }
};

// --- 4. Lấy chi tiết chuyến bay ---
const getFlightDetails = async (id) => {
     try {
        const flight = await Flight.findById(id)
            .populate('departureAirport')
            .populate('arrivalAirport')
            .populate('aircraft')
            .populate('pilots')          // Lấy thông tin phi công
            .populate('flightAttendants'); // Lấy thông tin tiếp viên
            
        if (!flight) return { EC: 1, EM: 'Không tìm thấy' };
        return { EC: 0, EM: 'OK', DT: flight };
    } catch (error) { return { EC: -1, EM: 'Lỗi server' }; }
};

// --- 5. Cập nhật chuyến bay (ĐÃ MỞ KHÓA ĐỂ CẬP NHẬT NHÂN SỰ) ---
const updateFlight = async (id, updateData) => {
    try {
        // Danh sách các trường được phép cập nhật
        const allowedUpdates = [
            'departureTime', 
            'arrivalTime', 
            'status',
            'pilots',            // <<-- Cho phép cập nhật Phi công
            'flightAttendants'   // <<-- Cho phép cập nhật Tiếp viên
        ];

        const updates = {};
        for (const key of allowedUpdates) {
            if (updateData[key] !== undefined) {
                updates[key] = updateData[key];
            }
        }

        const flight = await Flight.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
        if (!flight) return { EC: 1, EM: 'Không tìm thấy chuyến bay.' };
        
        return { EC: 0, EM: 'Cập nhật thành công!', DT: flight };
    } catch (error) {
        console.error(error);
        return { EC: -1, EM: 'Lỗi server' };
    }
};

// --- 6. Xóa chuyến bay ---
const deleteFlight = async (id) => {
    try {
        const flight = await Flight.findByIdAndDelete(id);
        if (!flight) return { EC: 1, EM: 'Không tìm thấy.' };
        return { EC: 0, EM: 'Xóa thành công!', DT: flight };
    } catch(e) { return { EC: -1, EM: 'Lỗi server' }; }
};

// --- 7. Tìm vé rẻ nhất (CHO TRANG CHỦ) ---
const findCheapestFlights = async () => {
    try {
        const today = new Date();

        // 1. Dùng aggregate để lấy ID các chuyến bay rẻ nhất
        const cheapestFlights = await Flight.aggregate([
            { $match: { departureTime: { $gte: today } } },
            { $sort: { 'basePrice.economy': 1 } },
            {
                $group: {
                    _id: { dep: '$departureAirport', arr: '$arrivalAirport' },
                    flightId: { $first: '$_id' }
                }
            },
            { $limit: 6 } // Lấy 6 chuyến rẻ nhất
        ]);

        // 2. Query lại bằng Mongoose để populate chuẩn xác
        const flightIds = cheapestFlights.map(item => item.flightId);
        
        const finalFlights = await Flight.find({ _id: { $in: flightIds } })
            .populate('departureAirport')
            .populate('arrivalAirport')
            .populate('aircraft')
            .lean();
        
        // 3. Map dữ liệu để khớp với frontend cũ (Home page)
        const formattedFlights = finalFlights.map(f => ({
            ...f,
            departureAirportInfo: f.departureAirport, 
            arrivalAirportInfo: f.arrivalAirport
        }));

        return { EC: 0, EM: 'OK', DT: formattedFlights };

    } catch (error) {
        console.error('❌ Lỗi tìm vé rẻ nhất:', error);
        return { EC: -1, EM: 'Lỗi server' };
    }
};

module.exports = { 
    createFlight, 
    getAllFlights, 
    searchFlights, 
    getFlightDetails,
    findCheapestFlights,
    updateFlight,
    deleteFlight
};