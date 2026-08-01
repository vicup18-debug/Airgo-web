require('dotenv').config();
const mongoose = require('mongoose');
const RideRequest = require('./backend/models/RideRequest');
const Booking = require('./backend/models/Booking');

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hotel-booking', { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to MongoDB');
        
        const rideRequest = await RideRequest.findOne({ status: 'pending' }).sort({ createdAt: -1 });
        if (!rideRequest) {
            console.log('No pending ride request found.');
            return;
        }
        
        console.log('Found RideRequest:', rideRequest._id.toString());
        
        // Simulating route logic
        const activeBookings = await Booking.find({
            $or: [
                { rideRequestId: rideRequest._id.toString() },
                { userId: rideRequest.userId, checkIn: rideRequest.checkIn }
            ],
            status: 'Pending Escrow'
        });
        
        console.log('Active Bookings:', activeBookings.length);
        
        console.log('No errors thrown in query.');
    } catch (err) {
        console.error('Error in script:', err);
    } finally {
        mongoose.disconnect();
    }
}
run();
