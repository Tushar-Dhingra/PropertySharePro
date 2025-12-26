import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Property from './models/Property.js';
import Activity from './models/Activity.js';

dotenv.config();

const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        console.log('Clearing existing data...');
        await User.deleteMany({});
        await Property.deleteMany({});
        await Activity.deleteMany({});

        // Create admin user
        console.log('Creating admin user...');
        const admin = await User.create({
            username: 'admin@propertyshare',
            email: 'admin@propertyshare.com',
            password: 'Admin@123',
            role: 'ADMIN',
            status: 'ACTIVE'
        });

        // Create employee users
        console.log('Creating employee users...');
        const employee1 = await User.create({
            username: 'john.doe',
            email: 'john.doe@propertyshare.com',
            password: 'Employee@123',
            role: 'EMPLOYEE',
            status: 'ACTIVE'
        });

        const employee2 = await User.create({
            username: 'jane.smith',
            email: 'jane.smith@propertyshare.com',
            password: 'Employee@123',
            role: 'EMPLOYEE',
            status: 'ACTIVE'
        });

        // Create sample properties
        console.log('Creating sample properties...');
        const properties = [
            {
                propertyName: 'Luxury 3BHK Apartment in Downtown',
                type: 'Apartment',
                location: '123 MG Road, Bangalore, Karnataka 560001',
                areaZone: 'Central Zone',
                rentAmount: 35000,
                securityDeposit: 105000,
                maintenanceCharges: 3500,
                features: {
                    parking: true,
                    gym: true,
                    security: true,
                    swimmingPool: true,
                    balcony: true,
                    clubhouse: true,
                    powerBackup: true,
                    lift: true,
                    intercom: true,
                    gasPipeline: true,
                    cctv: true,
                    waterSupply: true
                },
                uploadedBy: employee1._id,
                uploadedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
            },
            {
                propertyName: 'Modern Office Space in Tech Park',
                type: 'Office',
                location: 'Cyber City, Sector 12, Gurgaon, Haryana 122001',
                areaZone: 'North Zone',
                rentAmount: 85000,
                securityDeposit: 255000,
                maintenanceCharges: 8500,
                features: {
                    parking: true,
                    security: true,
                    powerBackup: true,
                    lift: true,
                    wifi: true,
                    cctv: true,
                    waterSupply: true
                },
                uploadedBy: employee2._id,
                uploadedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
            },
            {
                propertyName: 'Spacious Villa with Garden',
                type: 'Villa',
                location: 'Green Valley, Plot 45, Pune, Maharashtra 411001',
                areaZone: 'West Zone',
                rentAmount: 65000,
                securityDeposit: 195000,
                maintenanceCharges: 5000,
                features: {
                    parking: true,
                    security: true,
                    balcony: true,
                    powerBackup: true,
                    gasPipeline: true,
                    garden: true,
                    cctv: true,
                    waterSupply: true
                },
                uploadedBy: employee1._id,
                uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
            },
            {
                propertyName: '2BHK Budget Apartment',
                type: 'Apartment',
                location: 'Nehru Nagar, Mumbai, Maharashtra 400001',
                areaZone: 'South Zone',
                rentAmount: 22000,
                securityDeposit: 66000,
                maintenanceCharges: 2000,
                features: {
                    parking: true,
                    security: true,
                    lift: true,
                    waterSupply: true
                },
                uploadedBy: employee2._id,
                uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
            },
            {
                propertyName: 'Commercial Shop in Market',
                type: 'Shop',
                location: 'Main Market, Connaught Place, Delhi 110001',
                areaZone: 'Central Zone',
                rentAmount: 45000,
                securityDeposit: 135000,
                maintenanceCharges: 4000,
                features: {
                    security: true,
                    powerBackup: true,
                    cctv: true,
                    waterSupply: true
                },
                uploadedBy: employee1._id,
                uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
            },
            {
                propertyName: 'Premium PG Accommodation',
                type: 'PG',
                location: 'HSR Layout, Bangalore, Karnataka 560102',
                areaZone: 'East Zone',
                rentAmount: 12000,
                securityDeposit: 24000,
                maintenanceCharges: 0,
                features: {
                    security: true,
                    wifi: true,
                    powerBackup: true,
                    waterSupply: true
                },
                uploadedBy: employee2._id,
                uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
            }
        ];

        const createdProperties = await Property.insertMany(properties);

        // Create activity logs for uploads
        console.log('Creating activity logs...');
        const activities = createdProperties.map(property => ({
            userId: property.uploadedBy,
            action: 'UPLOAD',
            propertyId: property._id,
            metadata: {
                propertyName: property.propertyName
            },
            timestamp: property.uploadedAt
        }));

        // Add some login activities
        activities.push(
            {
                userId: admin._id,
                action: 'LOGIN',
                propertyId: null,
                timestamp: new Date()
            },
            {
                userId: employee1._id,
                action: 'LOGIN',
                propertyId: null,
                timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000)
            },
            {
                userId: employee2._id,
                action: 'LOGIN',
                propertyId: null,
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
            }
        );

        await Activity.insertMany(activities);

        console.log('\n✅ Database seeded successfully!');
        console.log('\n📊 Seed Summary:');
        console.log(`   - Users: ${await User.countDocuments()}`);
        console.log(`   - Properties: ${await Property.countDocuments()}`);
        console.log(`   - Activities: ${await Activity.countDocuments()}`);
        console.log('\n🔐 Demo Credentials:');
        console.log('   Admin:    admin@propertyshare / Admin@123');
        console.log('   Employee: john.doe / Employee@123');
        console.log('   Employee: jane.smith / Employee@123\n');

        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
};

seedDatabase();
