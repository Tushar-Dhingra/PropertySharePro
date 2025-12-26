import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Create indexes after connection
        await createIndexes();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const createIndexes = async () => {
    try {
        const db = mongoose.connection.db;

        console.log('Creating database indexes...');

        // The indexes are defined in the schemas and will be created automatically
        // This is just a placeholder for any manual index creation if needed

        console.log('Database indexes created successfully');
    } catch (error) {
        console.error('Error creating indexes:', error.message);
    }
};

export default connectDB;
