// src/seeders/aircraftSeeder.js
require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const Aircraft = require('../models/Aircraft');

const aircraftData = [
  { model: 'Boeing 787-9 Dreamliner', registrationNumber: 'VN-A868', seatCapacity: { economy: 280, business: 28 } },
  { model: 'Airbus A350-900', registrationNumber: 'VN-A899', seatCapacity: { economy: 270, business: 29 } },
  { model: 'Airbus A321neo', registrationNumber: 'VN-A637', seatCapacity: { economy: 180, business: 8 } }
];

const seedAircrafts = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        await Aircraft.deleteMany({});
        await Aircraft.insertMany(aircraftData);
        console.log(`✅ Đã tạo ${aircraftData.length} máy bay!`);
    } catch (error) { console.error(error); } 
    finally { mongoose.disconnect(); }
};
seedAircrafts();