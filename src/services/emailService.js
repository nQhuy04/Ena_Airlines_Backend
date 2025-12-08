// src/services/emailService.js

const nodemailer = require('nodemailer');
require('dotenv').config();

// ============================================================
// CẤU HÌNH TRANSPORTER (CHẾ ĐỘ SSL - PORT 465)
// ============================================================
// Lưu ý: Nếu Google chặn IP, hàm này sẽ báo lỗi timeout trong Log,
// nhưng sẽ KHÔNG làm crash luồng đặt vé của khách hàng.
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,              // Dùng Port SSL bảo mật
    secure: true,           // Port 465 bắt buộc secure: true
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
    },
    // Các cấu hình mạng giúp tối ưu kết nối (nếu có thể kết nối được)
    family: 4,              // Ép dùng IPv4
    pool: true,             // Tái sử dụng kết nối
    maxConnections: 1,      // Giới hạn kết nối để tránh Spam filter
    rateLimit: 1,           // Giới hạn 1 email/giây
    
    // Tăng thời gian chờ lên tối đa để server kiên nhẫn nhất có thể
    connectionTimeout: 60000, 
    greetingTimeout: 30000,
    socketTimeout: 60000,
    tls: {
        rejectUnauthorized: false
    }
});

// Kiểm tra kết nối lúc khởi động (Chỉ để log cho Admin biết tình trạng)
transporter.verify((error, success) => {
    if (error) {
        console.warn('⚠️ CẢNH BÁO EMAIL: Không kết nối được Gmail (Có thể do chặn IP). Tính năng Email sẽ bị tạm ngưng, nhưng hệ thống vẫn hoạt động bình thường.');
    } else {
        console.log('✅ EMAIL SERVICE: Đã kết nối thành công tới Gmail (SSL/Port 465).');
    }
});

// ============================================================
// CORE FUNCTION: GỬI MAIL "FAIL-SAFE"
// ============================================================
const sendEmail = async (to, subject, htmlContent) => {
    try {
        const mailOptions = {
            from: `"ENA Airlines System" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: subject,
            html: htmlContent
        };

        // Thử gửi email
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email đã gửi tới: ${to} | ID: ${info.messageId}`);
    } catch (error) {
        // QUAN TRỌNG: Bắt lỗi và chỉ Log ra console.
        // KHÔNG "throw error" để đảm bảo Server không bị dừng lại.
        console.error(`⚠️ GỬI EMAIL THẤT BẠI TỚI: ${to}`);
        console.error(`   Lý do: ${error.message}`);
        console.error('   -> Bỏ qua lỗi này để tiếp tục quy trình.');
    }
};

// ============================================================
// CÁC TEMPLATE GỬI MAIL (ĐÃ ĐƯỢC GIỮ NGUYÊN)
// ============================================================

// 1. EMAIL PENDING
const sendBookingPendingEmail = async (userEmail, bookingData, flightData) => {
    try {
        const subject = `✈️ Xác nhận đặt chỗ [${bookingData.bookingCode}] - Chờ xử lý`;
        const total = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(bookingData.totalAmount);
        
        const seatList = bookingData.bookedSeats && bookingData.bookedSeats.length > 0 
                         ? bookingData.bookedSeats.map(s => s.seatNumber).join(', ') 
                         : 'Đang cập nhật';
        
        const departureTime = new Date(flightData.departureTime);
        const timeString = departureTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        const dateString = departureTime.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

        const html = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #eee;">
            <div style="background:#006ce4;padding:20px;text-align:center;color:white;">
                <h2 style="margin:0;">ENA AIRLINES</h2>
                <p>Phiếu xác nhận yêu cầu</p>
            </div>
            <div style="padding:20px;">
                <p>Hệ thống đã ghi nhận yêu cầu đặt vé của bạn.</p>
                <div style="background:#fff8e6;border-left:5px solid #ffa940;padding:10px;margin:15px 0;color:#d48806;">
                    <strong>TRẠNG THÁI: CHỜ DUYỆT</strong><br>Vui lòng chờ nhân viên xác nhận.
                </div>
                <table style="width:100%;border-collapse:collapse;">
                    <tr><td style="padding:8px;color:#666;">Mã đặt chỗ:</td><td style="padding:8px;font-weight:bold;font-size:18px;">${bookingData.bookingCode}</td></tr>
                    <tr><td style="padding:8px;color:#666;">Chuyến bay:</td><td style="padding:8px;">${flightData.flightNumber}</td></tr>
                    <tr><td style="padding:8px;color:#666;">Khởi hành:</td><td style="padding:8px;">${timeString}, ${dateString}</td></tr>
                    <tr><td style="padding:8px;color:#666;">Ghế:</td><td style="padding:8px;color:#006ce4;">${seatList}</td></tr>
                    <tr><td style="padding:8px;color:#666;">Tổng tiền:</td><td style="padding:8px;font-weight:bold;">${total}</td></tr>
                </table>
            </div>
            <div style="background:#f4f4f4;padding:10px;text-align:center;font-size:12px;">© ENA Airlines</div>
        </div>`;
        
        await sendEmail(userEmail, subject, html);
    } catch (e) {
        console.error("Lỗi tạo template Pending Email:", e.message);
    }
};

// 2. EMAIL SUCCESS
const sendBookingSuccessEmail = async (userEmail, bookingData, flightData) => {
    try {
        const subject = `✅ VÉ ĐIỆN TỬ CỦA BẠN - Mã: ${bookingData.bookingCode}`;
        const total = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(bookingData.totalAmount);
        
        const seatList = bookingData.bookedSeats && bookingData.bookedSeats.length > 0 
                         ? bookingData.bookedSeats.map(s => s.seatNumber).join(', ') 
                         : 'N/A';
                         
        const departureTime = new Date(flightData.departureTime);
        const timeString = departureTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        const dateString = departureTime.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const userName = bookingData.user ? bookingData.user.name : 'Quý khách';

        const html = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:2px solid #28a745;border-radius:8px;overflow:hidden;">
            <div style="background:#28a745;padding:30px;text-align:center;color:white;">
                <h1 style="margin:0;">VÉ ĐIỆN TỬ</h1>
                <p style="margin:5px 0 0;">Đặt chỗ thành công - Confirmed</p>
            </div>
            <div style="padding:30px;">
                <div style="text-align:center;margin-bottom:30px;">
                    <div style="font-size:14px;color:#888;">MÃ ĐẶT CHỖ (PNR)</div>
                    <div style="font-size:32px;font-weight:900;color:#28a745;letter-spacing:3px;">${bookingData.bookingCode}</div>
                </div>

                <table style="width:100%;border-collapse:collapse;background:#f9f9f9;border-radius:8px;">
                    <tr>
                        <td style="padding:15px;border-bottom:1px solid #eee;color:#666;width:40%;">Chuyến bay</td>
                        <td style="padding:15px;border-bottom:1px solid #eee;font-weight:bold;font-size:18px;">${flightData.flightNumber}</td>
                    </tr>
                    <tr>
                        <td style="padding:15px;border-bottom:1px solid #eee;color:#666;">Nơi đi</td>
                        <td style="padding:15px;border-bottom:1px solid #eee;font-weight:600;">${flightData.departureAirport.city} (${flightData.departureAirport.iataCode})</td>
                    </tr>
                    <tr>
                        <td style="padding:15px;border-bottom:1px solid #eee;color:#666;">Nơi đến</td>
                        <td style="padding:15px;border-bottom:1px solid #eee;font-weight:600;">${flightData.arrivalAirport.city} (${flightData.arrivalAirport.iataCode})</td>
                    </tr>
                    <tr>
                        <td style="padding:15px;border-bottom:1px solid #eee;color:#666;">Ngày giờ bay</td>
                        <td style="padding:15px;border-bottom:1px solid #eee;font-weight:600;">${timeString} - ${dateString}</td>
                    </tr>
                    <tr>
                        <td style="padding:15px;border-bottom:1px solid #eee;color:#666;">Ghế ngồi</td>
                        <td style="padding:15px;border-bottom:1px solid #eee;color:#006ce4;font-weight:bold;">${seatList}</td>
                    </tr>
                    <tr>
                        <td style="padding:15px;color:#666;">Khách hàng</td>
                        <td style="padding:15px;font-weight:600;">${userName}</td>
                    </tr>
                </table>
                
                <div style="margin-top:20px;background:#e6f7ff;padding:15px;border-radius:5px;color:#0050b3;font-size:14px;text-align:center;">
                    Quý khách vui lòng có mặt tại sân bay trước <strong>90 phút</strong> để làm thủ tục.
                </div>
            </div>
            <div style="background:#28a745;color:white;padding:10px;text-align:center;font-size:12px;">
                ENA Airlines - Chúc quý khách thượng lộ bình an!
            </div>
        </div>`;

        await sendEmail(userEmail, subject, html);
    } catch (e) {
        console.error("Lỗi tạo template Success Email:", e.message);
    }
};

// 3. EMAIL USER CANCELLATION
const sendBookingCancellationEmail = async (userEmail, bookingData) => {
    try {
        const subject = `💸 Xác nhận Hoàn tiền - Mã đặt chỗ [${bookingData.bookingCode}]`;
        const total = bookingData.totalAmount || 0;
        const refundRate = 0.85; 
        const feeRate = 0.15;    
        const refundAmount = total * refundRate;
        const feeAmount = total * feeRate;

        const fmt = (num) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
        const userName = bookingData.user ? bookingData.user.name : 'Bạn';

        const html = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #eee;border-radius:8px;overflow:hidden;">
            <div style="background:#ff4d4f;padding:25px;text-align:center;color:white;">
                <h2 style="margin:0;font-size:22px;">YÊU CẦU HỦY VÉ THÀNH CÔNG</h2>
                <p style="margin:5px 0 0;opacity:0.9;">Xác nhận hoàn tiền tự động</p>
            </div>
            <div style="padding:30px;">
                <p>Xin chào <strong>${userName}</strong>,</p>
                <p>Theo yêu cầu của bạn, chúng tôi đã tiến hành hủy đơn đặt vé <strong>${bookingData.bookingCode}</strong>.</p>
                <div style="background:#fffbe6;border:1px solid #ffe58f;border-radius:8px;padding:20px;margin:25px 0;">
                    <h3 style="margin:0 0 15px 0;color:#d48806;font-size:16px;border-bottom:1px dashed #d48806;padding-bottom:10px;">
                        CHI TIẾT HOÀN TIỀN (REFUND)
                    </h3>
                    <table style="width:100%;font-size:15px;color:#333;">
                        <tr>
                            <td style="padding:5px 0;color:#666;">Giá trị vé ban đầu:</td>
                            <td style="padding:5px 0;text-align:right;font-weight:bold;">${fmt(total)}</td>
                        </tr>
                        <tr>
                            <td style="padding:5px 0;color:#cf1322;">Phí hủy vé (15%):</td>
                            <td style="padding:5px 0;text-align:right;color:#cf1322;">- ${fmt(feeAmount)}</td>
                        </tr>
                        <tr style="font-size:18px;">
                            <td style="padding-top:15px;font-weight:bold;color:#28a745;">SỐ TIỀN HOÀN LẠI:</td>
                            <td style="padding-top:15px;text-align:right;font-weight:900;color:#28a745;">${fmt(refundAmount)}</td>
                        </tr>
                    </table>
                </div>
                <div style="background:#f0f5ff;padding:15px;border-radius:5px;font-size:13px;color:#555;line-height:1.5;">
                    Khoản tiền <strong>${fmt(refundAmount)}</strong> sẽ được chuyển về tài khoản trong 24h.
                </div>
            </div>
            <div style="background:#fafafa;padding:15px;text-align:center;color:#ccc;font-size:12px;">
                ENA Airlines Automated System
            </div>
        </div>`;
        await sendEmail(userEmail, subject, html);
    } catch (e) {
        console.error("Lỗi tạo template Refund Email:", e.message);
    }
};


// 4. EMAIL ADMIN REJECT/CANCEL
const sendAdminCancellationEmail = async (userEmail, bookingData) => {
    try {
        const subject = `⚠️ Thông báo: Đơn hàng [${bookingData.bookingCode}] đã bị hủy`;
        const total = bookingData.totalAmount || 0;
        const fmt = (num) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
        const userName = bookingData.user ? bookingData.user.name : 'Bạn';

        const html = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #eee;border-top:5px solid #d48806;">
            <div style="padding:30px;">
                <h2 style="color:#333;margin-top:0;">ĐƠN HÀNG BỊ HỦY</h2>
                <p>Xin chào <strong>${userName}</strong>,</p>
                <p>Đơn đặt vé <strong>${bookingData.bookingCode}</strong> đã bị quản trị viên từ chối do vấn đề kỹ thuật hoặc xác minh.</p>
                <div style="background:#fffbe6;border:1px solid #ffe58f;border-radius:8px;padding:20px;margin:25px 0;">
                    <h3 style="margin:0 0 15px 0;color:#d48806;font-size:16px;border-bottom:1px dashed #d48806;padding-bottom:10px;">
                        CHÍNH SÁCH BẢO VỆ (HOÀN 100%)
                    </h3>
                    <table style="width:100%;font-size:15px;color:#333;">
                        <tr>
                            <td style="padding:5px 0;color:#666;">Giá trị vé đã thanh toán:</td>
                            <td style="padding:5px 0;text-align:right;font-weight:bold;">${fmt(total)}</td>
                        </tr>
                        <tr style="font-size:18px;">
                            <td style="padding-top:15px;font-weight:bold;color:#006ce4;">SỐ TIỀN HOÀN LẠI:</td>
                            <td style="padding-top:15px;text-align:right;font-weight:900;color:#006ce4;">${fmt(total)}</td>
                        </tr>
                    </table>
                </div>
                <div style="background:#f0f5ff;padding:15px;border-radius:5px;font-size:13px;color:#555;line-height:1.5;">
                    Chúng tôi chân thành xin lỗi về sự bất tiện này.
                </div>
            </div>
            <div style="background:#fafafa;padding:15px;text-align:center;color:#ccc;font-size:12px;">
                ENA Airlines Support
            </div>
        </div>`;

        await sendEmail(userEmail, subject, html);
    } catch (e) {
        console.error("Lỗi tạo template Admin Refund Email:", e.message);
    }
};

module.exports = { 
    sendBookingPendingEmail, 
    sendBookingSuccessEmail, 
    sendBookingCancellationEmail, 
    sendAdminCancellationEmail,
    sendEmail
};