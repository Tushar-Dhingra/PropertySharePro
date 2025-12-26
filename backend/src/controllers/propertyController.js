import Property from '../models/Property.js';
import Activity from '../models/Activity.js';

// @desc    Get all properties with search and filters
// @route   GET /api/properties
// @access  Private
export const getProperties = async (req, res) => {
    try {
        const {
            search,
            areaZone,
            type,
            uploadedBy,
            minRent,
            maxRent,
            page = 1,
            limit = 20,
            sort
        } = req.query;

        // Build query
        const query = { isActive: true };

        // Role-based access control
        if (req.user.role !== 'ADMIN') {
            query.uploadedBy = req.user._id;
        }

        // Text search (partial match)
        if (search) {
            query.$or = [
                { propertyName: { $regex: search, $options: 'i' } },
                { location: { $regex: search, $options: 'i' } }
            ];
        }

        // Filters
        if (areaZone) {
            query.areaZone = areaZone;
        }

        if (type) {
            query.type = type;
        }

        if (uploadedBy) {
            query.uploadedBy = uploadedBy;
        }

        // Rent range filter
        if (minRent || maxRent) {
            query.rentAmount = {};
            if (minRent) query.rentAmount.$gte = parseInt(minRent);
            if (maxRent) query.rentAmount.$lte = parseInt(maxRent);
        }

        // Sorting
        let sortQuery = { uploadedAt: -1 }; // Default sort
        if (sort) {
            const [field, order] = sort.split(':');
            sortQuery = { [field]: order === 'desc' ? -1 : 1 };
        }

        // Pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Execute query with pagination
        const properties = await Property.find(query)
            .populate('uploadedBy', 'username email')
            .sort(sortQuery)
            .skip(skip)
            .limit(limitNum);

        // Get total count for pagination
        const total = await Property.countDocuments(query);

        res.status(200).json({
            success: true,
            count: properties.length,
            total,
            page: pageNum,
            pages: Math.ceil(total / limitNum),
            data: properties
        });
    } catch (error) {
        console.error('Get properties error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching properties',
            error: error.message
        });
    }
};

// @desc    Get property statistics
// @route   GET /api/properties/stats
// @access  Private
export const getPropertyStats = async (req, res) => {
    try {
        const query = { isActive: true };

        // Role-based access control
        if (req.user.role !== 'ADMIN') {
            query.uploadedBy = req.user._id;
        }

        const stats = await Property.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    totalProperties: { $sum: 1 },
                    residentialCount: {
                        $sum: { $cond: [{ $eq: ['$type', 'Residential'] }, 1, 0] }
                    },
                    commercialCount: {
                        $sum: { $cond: [{ $eq: ['$type', 'Commercial'] }, 1, 0] }
                    },
                    totalRent: { $sum: '$rentAmount' },
                    avgRent: { $avg: '$rentAmount' }
                }
            }
        ]);

        const result = stats.length > 0 ? stats[0] : {
            totalProperties: 0,
            residentialCount: 0,
            commercialCount: 0,
            totalRent: 0,
            avgRent: 0
        };

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Property stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching property statistics',
            error: error.message
        });
    }
};

// @desc    Get single property
// @route   GET /api/properties/:id
// @access  Private
export const getProperty = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id).populate(
            'uploadedBy',
            'username email'
        );

        if (!property || !property.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }

        res.status(200).json({
            success: true,
            data: property
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching property',
            error: error.message
        });
    }
};

// @desc    Create new property
// @route   POST /api/properties
// @access  Private
export const createProperty = async (req, res) => {
    try {
        // Add uploaded by user
        req.body.uploadedBy = req.user._id;
        req.body.uploadedAt = new Date();

        const property = await Property.create(req.body);

        // Log upload activity
        await Activity.create({
            userId: req.user._id,
            action: 'UPLOAD',
            propertyId: property._id,
            metadata: {
                propertyName: property.propertyName
            },
            timestamp: new Date()
        });

        // Populate uploaded by user info
        await property.populate('uploadedBy', 'username email');

        res.status(201).json({
            success: true,
            message: 'Property created successfully',
            data: property
        });
    } catch (error) {
        console.error('Create property error:', error);

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: messages
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error creating property',
            error: error.message
        });
    }
};

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private
export const updateProperty = async (req, res) => {
    try {
        let property = await Property.findById(req.params.id);

        if (!property || !property.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }

        // Check permission: owner or admin
        if (
            property.uploadedBy.toString() !== req.user._id.toString() &&
            req.user.role !== 'ADMIN'
        ) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this property'
            });
        }

        // Don't allow changing uploadedBy or uploadedAt
        delete req.body.uploadedBy;
        delete req.body.uploadedAt;

        property = await Property.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        }).populate('uploadedBy', 'username email');

        // Log edit activity
        await Activity.create({
            userId: req.user._id,
            action: 'EDIT',
            propertyId: property._id,
            metadata: {
                propertyName: property.propertyName
            },
            timestamp: new Date()
        });

        res.status(200).json({
            success: true,
            message: 'Property updated successfully',
            data: property
        });
    } catch (error) {
        console.error('Update property error:', error);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: messages
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error updating property',
            error: error.message
        });
    }
};

// @desc    Delete property (soft delete)
// @route   DELETE /api/properties/:id
// @access  Private
export const deleteProperty = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);

        if (!property || !property.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }

        // Check permission: owner or admin
        if (
            property.uploadedBy.toString() !== req.user._id.toString() &&
            req.user.role !== 'ADMIN'
        ) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this property'
            });
        }

        // Soft delete
        property.isActive = false;
        await property.save();

        // Log delete activity
        await Activity.create({
            userId: req.user._id,
            action: 'DELETE',
            propertyId: property._id,
            metadata: {
                propertyName: property.propertyName
            },
            timestamp: new Date()
        });

        res.status(200).json({
            success: true,
            message: 'Property deleted successfully'
        });
    } catch (error) {
        console.error('Delete property error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting property',
            error: error.message
        });
    }
};
