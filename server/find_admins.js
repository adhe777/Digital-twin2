const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const findAdmins = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const admins = await User.find({ isAdmin: true }, 'name email isAdmin');
        console.log('Admin Users Found:');
        console.log(JSON.stringify(admins, null, 2));
        await mongoose.connection.close();
    } catch (err) {
        console.error('Error:', err);
    }
};

findAdmins();
