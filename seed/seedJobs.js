const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Company = require('../models/Company');
const Job = require('../models/Job');

dotenv.config();

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Clean up
        await User.deleteMany();
        await Company.deleteMany();
        await Job.deleteMany();

        // Create Admin
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@test.com',
            password: 'password123',
            role: 'admin'
        });

        // Create Company Owner
        const owner = await User.create({
            name: 'Company Owner',
            email: 'owner@test.com',
            password: 'password123',
            role: 'company'
        });

        // Create Student
        const student = await User.create({
            name: 'Student User',
            email: 'student@test.com',
            password: 'password123',
            role: 'student',
            mobile: '1234567890',
            status: 'fresher'
        });

        // Create Company
        const company = await Company.create({
            name: 'InnovateTech',
            industry: 'Software',
            location: 'Bangalore',
            description: 'A leading tech company',
            owner: owner._id
        });

        // Create Jobs
        await Job.create([
            {
                title: 'Senior Frontend Developer',
                company: company._id,
                location: 'Bangalore',
                type: 'Full-time',
                salary: '20-30 LPA',
                description: 'React expert needed',
                postedBy: owner._id
            },
            {
                title: 'Backend Engineer',
                company: company._id,
                location: 'Remote',
                type: 'Contract',
                salary: '15-25 LPA',
                description: 'Node.js and MongoDB expert',
                postedBy: owner._id
            }
        ]);

        console.log('Data seeded successfully! 🌱');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seed();
