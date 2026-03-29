const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const makeAdmin = async (identifier) => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        let query = {};
        if (mongoose.Types.ObjectId.isValid(identifier)) {
            query = { _id: identifier };
        } else {
            query = { email: identifier };
        }

        const user = await User.findOneAndUpdate(
            query,
            { $set: { isAdmin: true } },
            { new: true }
        );

        if (user) {
            console.log(`User ${user.email} (ID: ${user._id}) is now an admin.`);
        } else {
            console.log(`User ${identifier} not found.`);
        }

        await mongoose.connection.close();
    } catch (err) {
        console.error('Error:', err);
    }
};

const identifier = process.argv[2];
if (!identifier) {
    console.log('Please provide an email address or User ID.');
    process.exit(1);
}

makeAdmin(identifier);
