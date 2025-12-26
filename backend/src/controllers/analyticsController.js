import Property from '../models/Property.js';
import Activity from '../models/Activity.js';
import User from '../models/User.js';

// @desc    Get dashboard analytics
// @route   GET /api/analytics/dashboard
// @access  Private
export const getDashboardAnalytics = async (req, res) => {
    try {
        const userId = req.user._id;
        const isAdmin = req.user.role === 'ADMIN';

        // Total properties (all for admin, own for employee)
        const propertyQuery = isAdmin ? { isActive: true } : { uploadedBy: userId, isActive: true };
        const totalProperties = await Property.countDocuments(propertyQuery);

        // Daily uploads (today)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dailyQuery = {
            action: 'UPLOAD',
            timestamp: { $gte: today }
        };
        if (!isAdmin) {
            dailyQuery.userId = userId;
        }

        const dailyUploads = await Activity.countDocuments(dailyQuery);

        // Weekly uploads (last 7 days)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const weeklyQuery = {
            action: 'UPLOAD',
            timestamp: { $gte: weekAgo }
        };
        if (!isAdmin) {
            weeklyQuery.userId = userId;
        }

        const weeklyUploads = await Activity.countDocuments(weeklyQuery);

        // Previous week uploads for trend calculation
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

        const prevWeekQuery = {
            action: 'UPLOAD',
            timestamp: { $gte: twoWeeksAgo, $lt: weekAgo }
        };
        if (!isAdmin) {
            prevWeekQuery.userId = userId;
        }

        const prevWeekUploads = await Activity.countDocuments(prevWeekQuery);

        // Calculate trend percentage
        const weeklyTrend =
            prevWeekUploads > 0
                ? ((weeklyUploads - prevWeekUploads) / prevWeekUploads) * 100
                : weeklyUploads > 0
                    ? 100
                    : 0;

        // Active employees count (Admin only)
        let activeEmployees = 0;
        if (isAdmin) {
            activeEmployees = await User.countDocuments({ role: 'EMPLOYEE', status: 'ACTIVE' });
        }

        res.status(200).json({
            success: true,
            data: {
                totalProperties,
                dailyUploads,
                weeklyUploads,
                weeklyTrend: Math.round(weeklyTrend * 10) / 10, // Round to 1 decimal
                activeEmployees: isAdmin ? activeEmployees : null
            }
        });
    } catch (error) {
        console.error('Dashboard analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard analytics',
            error: error.message
        });
    }
};

// @desc    Get daily upload activity chart data
// @route   GET /api/analytics/daily-uploads
// @access  Private
export const getDailyUploads = async (req, res) => {
    try {
        const userId = req.user._id;
        const isAdmin = req.user.role === 'ADMIN';

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const matchQuery = {
            action: 'UPLOAD',
            timestamp: { $gte: sevenDaysAgo }
        };

        if (!isAdmin) {
            matchQuery.userId = userId;
        }

        const dailyData = await Activity.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Format data for chart
        const chartData = dailyData.map(item => ({
            date: item._id,
            uploads: item.count
        }));

        res.status(200).json({
            success: true,
            data: chartData
        });
    } catch (error) {
        console.error('Daily uploads error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching daily upload data',
            error: error.message
        });
    }
};

// @desc    Get weekly upload trends chart data
// @route   GET /api/analytics/weekly-trends
// @access  Private
export const getWeeklyTrends = async (req, res) => {
    try {
        const userId = req.user._id;
        const isAdmin = req.user.role === 'ADMIN';

        const sixWeeksAgo = new Date();
        sixWeeksAgo.setDate(sixWeeksAgo.getDate() - 42);

        const matchQuery = {
            action: 'UPLOAD',
            timestamp: { $gte: sixWeeksAgo }
        };

        if (!isAdmin) {
            matchQuery.userId = userId;
        }

        const weeklyData = await Activity.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: {
                        year: { $year: '$timestamp' },
                        week: { $week: '$timestamp' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.week': 1 } }
        ]);

        // Format data for chart
        const chartData = weeklyData.map(item => ({
            week: `Week ${item._id.week}`,
            uploads: item.count
        }));

        res.status(200).json({
            success: true,
            data: chartData
        });
    } catch (error) {
        console.error('Weekly trends error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching weekly trend data',
            error: error.message
        });
    }
};

// @desc    Get employee activity (Admin only)
// @route   GET /api/analytics/employee/:id/activity
// @access  Private (Admin only)
export const getEmployeeActivity = async (req, res) => {
    try {
        const employeeId = req.params.id;

        const activityStats = await Activity.aggregate([
            {
                $match: {
                    userId: employeeId,
                    action: { $in: ['UPLOAD', 'EDIT', 'DELETE'] }
                }
            },
            {
                $group: {
                    _id: '$action',
                    count: { $sum: 1 }
                }
            }
        ]);

        const stats = {
            uploads: 0,
            edits: 0,
            deletes: 0
        };

        activityStats.forEach(item => {
            if (item._id === 'UPLOAD') stats.uploads = item.count;
            if (item._id === 'EDIT') stats.edits = item.count;
            if (item._id === 'DELETE') stats.deletes = item.count;
        });

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching employee activity',
            error: error.message
        });
    }
};

// @desc    Get employee statistics for admin dashboard
// @route   GET /api/analytics/employee-stats
// @access  Private (Admin only)
export const getEmployeeStats = async (req, res) => {
    try {
        const users = await User.find({ role: 'EMPLOYEE' });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const stats = await Promise.all(users.map(async (user) => {
            // Get today's count
            const todayCount = await Activity.countDocuments({
                userId: user._id,
                action: { $in: ['UPLOAD', 'EDIT'] },
                timestamp: { $gte: today }
            });

            // Get this week's count
            const weekCount = await Activity.countDocuments({
                userId: user._id,
                action: { $in: ['UPLOAD', 'EDIT'] },
                timestamp: { $gte: weekAgo }
            });

            // Get total count
            const totalCount = await Activity.countDocuments({
                userId: user._id,
                action: { $in: ['UPLOAD', 'EDIT'] }
            });

            // Determine performance
            let performance = 'average';
            if (weekCount > 5) performance = 'good';
            if (weekCount > 10) performance = 'excellent';
            if (weekCount === 0) performance = 'poor';

            return {
                id: user._id,
                name: user.username,
                email: user.email,
                today: todayCount,
                thisWeek: weekCount,
                total: totalCount,
                performance,
                status: user.status
            };
        }));

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Employee stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching employee statistics',
            error: error.message
        });
    }
};
