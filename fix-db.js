import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { db } from './config/database.js';

dotenv.config();

const fixDatabase = async () => {
    try {
        console.log('🔍 Connecting to MongoDB...');
        await db.connect();
        const conn = mongoose.connection;
        const ordersCollection = conn.db.collection('orders');

        console.log('📊 Looking for corrupted orders where phase_2 is a string...');

        // Find orders where phase_2 is a string
        const corruptedOrders = await ordersCollection.find({ phase_2: { $type: 'string' } }).toArray();

        console.log(`📝 Found ${corruptedOrders.length} corrupted orders.`);

        for (const order of corruptedOrders) {
            console.log(`🛠 Fixing order: ${order.orderId || order._id}`);

            // If it's a string like "Array()", we should probably reset it to a proper object structure
            // or at least remove the string value so Mongoose can apply defaults.

            await ordersCollection.updateOne(
                { _id: order._id },
                {
                    $set: {
                        phase_2: {
                            content: {},
                            uploaded_images_mode1: [],
                            uploaded_images_cuisine: [],
                            uploaded_images_chambre_oui2: [],
                            uploaded_images_chambre2: []
                        }
                    }
                }
            );
        }

        console.log('✅ Database fix completed!');
        await db.disconnect();
    } catch (error) {
        console.error('❌ Database fix failed:', error);
    }
};

fixDatabase();
