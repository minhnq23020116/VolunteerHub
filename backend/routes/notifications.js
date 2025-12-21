const express = require('express');
const { auth } = require('../middleware/auth');
const Notifications = require('../models/Notification');

const router = express.Router();

// GET /api/notifications - Lấy danh sách notifications của user
router.get('/', auth, async (req, res) => {
    try {
        const notifications = await Notifications.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50);

        // Format response để match với frontend
        const formatted = notifications.map(n => ({
            id: n._id.toString(),
            type: n.type,
            title: n.title,
            message: n.message,
            read: n.read,
            timestamp: formatTimestamp(n.createdAt),
            createdAt: n.createdAt
        }));

        res.json(formatted);
    } catch (err) {
        console.error('Get notifications error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PATCH /api/notifications/:id/read - Đánh dấu 1 notification đã đọc
router.patch('/:id/read', auth, async (req, res) => {
    try {
        const notification = await Notifications.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ error: 'Notifications not found' });
        }

        res.json({ success: true });
    } catch (err) {
        console.error('Mark read error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PATCH /api/notifications/read-all - Đánh dấu tất cả đã đọc
router.patch('/read-all', auth, async (req, res) => {
    try {
        await Notifications.updateMany(
            { userId: req.user._id, read: false },
            { read: true }
        );

        res.json({ success: true });
    } catch (err) {
        console.error('Mark all read error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/notifications/:id - Xóa 1 notification
router.delete('/:id', auth, async (req, res) => {
    try {
        const notification = await Notifications.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!notification) {
            return res.status(404).json({ error: 'Notifications not found' });
        }

        res.json({ success: true });
    } catch (err) {
        console.error('Delete notification error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Helper function để format timestamp
function formatTimestamp(date) {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 7) {
        return date.toLocaleDateString();
    } else if (days > 0) {
        return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
        return 'Just now';
    }
}

module.exports = router;