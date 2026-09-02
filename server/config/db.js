const mongoose = require('mongoose');

const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected successfully');
    }catch(err){
        console.error('\n❌ MongoDB connection FAILED:');
        if (err.message && err.message.includes('querySrv ENOTFOUND')) {
            console.error('  → DNS SRV lookup failed. Possible causes:');
            console.error('    1. MongoDB Atlas cluster is PAUSED or DELETED');
            console.error('    2. Wrong MONGO_URI / cluster hostname');
            console.error('    3. Network/DNS block (VPN, firewall, corporate proxy)');
            console.error('    4. No internet connection');
            console.error('\n  → Fix: Check Atlas dashboard, verify MONGO_URI, or use local MongoDB (mongodb://localhost:27017/devprep)');
        } else if (err.message && err.message.includes('authentication')) {
            console.error('  → Authentication failed. Check username/password in MONGO_URI');
        } else {
            console.error('  →', err.message);
        }
        process.exit(1);
    }
}

module.exports = connectDB;