const express = require('express');
const User = require('../models/User');
const ManagerRequest = require('../models/ManagerRequest'); // Thêm import
const { auth, permit } = require('../middleware/auth');

const router = express.Router();

// Middleware chung: Chỉ Admin mới được truy cập file này
router.use(auth, permit('admin'));

// Get list of users ( volunteers & managers )
// GET /api/admin/users
router.get('/users', async (req, res) => {
    try {
        // Có thể thêm query ?role=volunteer để lọc
        const q = {};
        if (req.query.role) {
            q.role = req.query.role;
        } else {
            // Mặc định không lấy admin khác, chỉ lấy volunteer và manager
            q.role = { $in: ['volunteer', 'manager'] };
        }

        const users = await User.find(q)
            .select('-passwordHash') // Không trả về mật khẩu
            .sort({ createdAt: -1 });

        // Format data để match với frontend
        const formatted = users.map(user => ({
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            avatar: user.avatar || '',
            accountType: user.role,
            hoursVolunteered: user.hoursVolunteered || 0,
            eventsAttended: user.eventsAttended || 0,
            joinedDate: new Date(user.createdAt).toLocaleDateString(),
            bio: user.bio || '',
            isLocked: user.isLocked
        }));

        res.json(formatted);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/admin/manager-requests - Lấy danh sách manager requests
router.get('/manager-requests', async (req, res) => {
    try {
        const requests = await ManagerRequest.find({ status: 'pending' })
            .populate('userId', 'name email avatar')
            .sort({ createdAt: -1 });

        const formatted = requests.map(req => ({
            id: req._id.toString(),
            name: req.userId.name,
            email: req.userId.email,
            avatar: req.userId.avatar || '',
            organization: req.organization,
            reason: req.reason,
            status: req.status,
            createdAt: req.createdAt
        }));

        res.json(formatted);
    } catch (err) {
        console.error('Get manager requests error:', err);
        res.status(500).json({ error: err.message });
    }
});

// PATCH /api/admin/manager-requests/:id/approve - Approve manager request
router.patch('/manager-requests/:id/approve', async (req, res) => {
    try {
        const request = await ManagerRequest.findById(req.params.id).populate('userId');

        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }

        // Update user role to manager
        await User.findByIdAndUpdate(request.userId._id, { role: 'manager' });

        // Update request status
        request.status = 'approved';
        await request.save();

        res.json({ ok: true, message: 'Manager request approved' });
    } catch (err) {
        console.error('Approve manager error:', err);
        res.status(500).json({ error: err.message });
    }
});

// PATCH /api/admin/manager-requests/:id/reject - Reject manager request
router.patch('/manager-requests/:id/reject', async (req, res) => {
    try {
        const request = await ManagerRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }

        request.status = 'rejected';
        await request.save();

        res.json({ ok: true, message: 'Manager request rejected' });
    } catch (err) {
        console.error('Reject manager error:', err);
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/admin/users/:id - Xóa user
router.delete('/users/:id', async (req, res) => {
    try {
        // Không cho phép xóa chính mình
        if (req.params.id === req.user._id.toString()) {
            return res.status(400).json({ error: 'Cannot delete your own admin account' });
        }

        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ ok: true, message: 'User deleted successfully' });
    } catch (err) {
        console.error('Delete user error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Lock user account
// PATCH /api/admin/users/:id/lock
router.patch('/users/:id/lock', async (req, res) => {
    try {
        // Không cho phép tự khóa chính mình
        if (req.params.id === req.user._id.toString()) {
            return res.status(400).json({ error: 'Cannot lock your own admin account' });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isLocked: true },
            { new: true } // Trả về data mới sau khi update
        ).select('-passwordHash');

        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ ok: true, message: 'User locked', user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Unlock user account
// PATCH /api/admin/users/:id/unlock
router.patch('/users/:id/unlock', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isLocked: false },
            { new: true }
        ).select('-passwordHash');

        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ ok: true, message: 'User unlocked', user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/admin/export/users - Export users data
router.get('/export/users', async (req, res) => {
    try {
        const users = await User.find({ role: { $in: ['volunteer', 'manager'] } })
            .select('-passwordHash')
            .sort({ createdAt: -1 });

        const formatted = users.map(user => ({
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            accountType: user.role,
            hoursVolunteered: user.hoursVolunteered || 0,
            eventsAttended: user.eventsAttended || 0,
            joinedDate: new Date(user.createdAt).toLocaleDateString()
        }));

        res.json(formatted);
    } catch (err) {
        console.error('Export users error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;