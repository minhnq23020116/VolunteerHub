const express = require('express');
const User = require('../models/User');
const { auth, permit } = require('../middleware/auth');

const router = express.Router();

// Middleware chung: Chỉ Admin mới được truy cập file này
router.use(auth, permit('admin'));

// Get list of users ( volunteers & managers )
// GET /api/admin/users
router.get('/', async (req, res) => {
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
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Lock user account
// PATCH /api/admin/users/:id/lock
router.patch('/:id/lock', async (req, res) => {
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
router.patch('/:id/unlock', async (req, res) => {
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

module.exports = router;