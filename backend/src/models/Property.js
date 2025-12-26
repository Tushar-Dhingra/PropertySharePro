import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema(
    {
        propertyName: {
            type: String,
            required: [true, 'Property name is required'],
            trim: true,
            minlength: [3, 'Property name must be at least 3 characters'],
            maxlength: [100, 'Property name cannot exceed 100 characters']
        },
        type: {
            type: String,
            required: [true, 'Property type is required'],
            enum: {
                values: ['Apartment', 'Villa', 'Office', 'Shop', 'Warehouse', 'Land', 'PG', 'Hostel'],
                message: 'Invalid property type'
            }
        },
        location: {
            type: String,
            required: [true, 'Location is required'],
            trim: true,
            minlength: [10, 'Location must be at least 10 characters'],
            maxlength: [200, 'Location cannot exceed 200 characters']
        },
        areaZone: {
            type: String,
            required: [true, 'Area zone is required'],
            enum: {
                values: ['North Zone', 'South Zone', 'East Zone', 'West Zone', 'Central Zone', 'Suburban'],
                message: 'Invalid area zone'
            }
        },
        rentAmount: {
            type: Number,
            required: [true, 'Rent amount is required'],
            min: [0, 'Rent amount cannot be negative'],
            validate: {
                validator: Number.isInteger,
                message: 'Rent amount must be an integer'
            }
        },
        securityDeposit: {
            type: Number,
            required: [true, 'Security deposit is required'],
            min: [0, 'Security deposit cannot be negative'],
            validate: {
                validator: Number.isInteger,
                message: 'Security deposit must be an integer'
            }
        },
        maintenanceCharges: {
            type: Number,
            default: 0,
            min: [0, 'Maintenance charges cannot be negative'],
            validate: {
                validator: Number.isInteger,
                message: 'Maintenance charges must be an integer'
            }
        },
        features: {
            parking: { type: Boolean, default: false },
            gym: { type: Boolean, default: false },
            security: { type: Boolean, default: false },
            swimmingPool: { type: Boolean, default: false },
            balcony: { type: Boolean, default: false },
            clubhouse: { type: Boolean, default: false },
            powerBackup: { type: Boolean, default: false },
            lift: { type: Boolean, default: false },
            intercom: { type: Boolean, default: false },
            gasPipeline: { type: Boolean, default: false },
            wifi: { type: Boolean, default: false },
            garden: { type: Boolean, default: false },
            playground: { type: Boolean, default: false },
            cctv: { type: Boolean, default: false },
            waterSupply: { type: Boolean, default: false }
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Uploaded by user is required']
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true // Adds updatedAt automatically
    }
);

// Text search index
propertySchema.index({ propertyName: 'text', location: 'text' });

// Filter indexes
propertySchema.index({ areaZone: 1 });
propertySchema.index({ type: 1 });
propertySchema.index({ uploadedBy: 1 });
propertySchema.index({ rentAmount: 1 });
propertySchema.index({ isActive: 1 });

// Compound indexes for common queries
propertySchema.index({ isActive: 1, uploadedAt: -1 });
propertySchema.index({ uploadedBy: 1, uploadedAt: -1 });
propertySchema.index({ areaZone: 1, type: 1, rentAmount: 1 });

// Don't return __v in JSON
propertySchema.methods.toJSON = function () {
    const property = this.toObject();
    delete property.__v;
    return property;
};

const Property = mongoose.model('Property', propertySchema);

export default Property;
