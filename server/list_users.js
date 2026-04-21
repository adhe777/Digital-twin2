const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const findAllUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find({}, 'name email role isAdmin');
        console.log('All Users Found:');
        console.log(JSON.stringify(users, null, 2));
        await mongoose.connection.close();
    } catch (err) {
        console.error('Error:', err);
    }
};

findAllUsers();
