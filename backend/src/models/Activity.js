import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    action: {
        type: String,
        required: [true, 'Action type is required'],
        enum: {
            values: ['LOGIN', 'UPLOAD', 'EDIT', 'DELETE'],
            message: 'Action must be LOGIN, UPLOAD, EDIT, or DELETE'
        }
    },
    propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        default: null // Null for LOGIN actions
    },
    metadata: {
        propertyName: {
            type: String,
            trim: true
        },
        changes: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        }
    },
    timestamp: {
        type: Date,
        default: Date.now,
        required: true
    }
});

// Indexes for analytics queries
activitySchema.index({ timestamp: -1 });
activitySchema.index({ userId: 1, timestamp: -1 });
activitySchema.index({ action: 1, timestamp: -1 });
activitySchema.index({ timestamp: 1, action: 1 });
activitySchema.index({ userId: 1, action: 1, timestamp: -1 });

// Don't return __v in JSON
activitySchema.methods.toJSON = function () {
    const activity = this.toObject();
    delete activity.__v;
    return activity;
};

const Activity = mongoose.model('Activity', activitySchema);

export default Activity;
