const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const manageAdmin = async (action, email, password = 'password123') => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        if (action === 'create') {
            let user = await User.findOne({ email });
            if (user) {
                user.isAdmin = true;
                await user.save();
                console.log(`User ${email} already existed; elevated to admin.`);
            } else {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);
                
                user = new User({
                    name: 'System Admin',
                    email: email,
                    password: hashedPassword,
                    role: 'Professional',
                    isAdmin: true
                });
                await user.save();
                console.log(`New Admin created: ${email}`);
            }
        } else if (action === 'remove') {
            const user = await User.findOneAndUpdate(
                { email: email },
                { $set: { isAdmin: false } },
                { new: true }
            );
            if (user) {
                console.log(`Admin status removed from ${email}.`);
            } else {
                console.log(`User ${email} not found.`);
            }
        }

        await mongoose.connection.close();
    } catch (err) {
        console.error('Error:', err);
    }
};

const action = process.argv[2]; // 'create' or 'remove'
const email = process.argv[3];
const password = process.argv[4];

if (!action || !email) {
    console.log('Usage: node manage_admin.js <create|remove> <email> [password]');
    process.exit(1);
}

manageAdmin(action, email, password);
