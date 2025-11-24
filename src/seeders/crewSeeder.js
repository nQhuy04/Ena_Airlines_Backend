// src/seeders/crewSeeder.js

require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const CrewMember = require('../models/CrewMember');

const crewData = [
    // --- PHI CÔNG ---
    { 
        name: "Nguyễn Văn Minh", 
        role: "pilot", rank: "Cơ trưởng (Captain)", 
        employeeId: "PIL001", 
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop" 
    },
    { 
        name: "Trần Quang Thắng", 
        role: "pilot", rank: "Cơ phó (First Officer)", 
        employeeId: "PIL002", 
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop" 
    },
    { 
        name: "Le Thi Thu Ha", 
        role: "pilot", rank: "Cơ trưởng", 
        employeeId: "PIL003", 
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976&auto=format&fit=crop" 
    },
    { 
        name: "Pham Nhat Vuong", 
        role: "pilot", rank: "Cơ phó", 
        employeeId: "PIL004", 
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070&auto=format&fit=crop" 
    },
    
    // --- TIẾP VIÊN ---
    { 
        name: "Nguyễn Thị Lan", 
        role: "flight_attendant", rank: "Tiếp viên trưởng", 
        employeeId: "FA001", 
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961&auto=format&fit=crop" 
    },
    { 
        name: "Hoàng Thu Trang", 
        role: "flight_attendant", rank: "Tiếp viên", 
        employeeId: "FA002", 
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1888&auto=format&fit=crop" 
    },
    { 
        name: "Trần Bảo Ngọc", 
        role: "flight_attendant", rank: "Tiếp viên", 
        employeeId: "FA003", 
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070&auto=format&fit=crop" 
    },
    { 
        name: "Lê Văn Đạt", 
        role: "flight_attendant", rank: "Tiếp viên", 
        employeeId: "FA004", 
        avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=1974&auto=format&fit=crop" 
    },
];

const seedCrew = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("🚀 Đang tuyển dụng nhân sự...");
        await CrewMember.deleteMany({});
        await CrewMember.insertMany(crewData);
        console.log("✅ Đã cập nhật danh sách nhân sự 'sang xịn mịn'!");
    } catch (error) {
        console.log(error);
    } finally {
        mongoose.disconnect();
    }
};

seedCrew();