const express = require('express');
const { auth, permit } = require('../middleware/auth');
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const Notification = require('../models/Notification'); // ← THÊM DÒNG NÀY

const router = express.Router();

// --- PHẦN DÀNH CHO TÌNH NGUYỆN VIÊN (Volunteer) ---

// Get my registration history
// GET /api/registrations/me/history
router.get('/me/history', auth, permit('volunteer'), async (req, res) => {
    try {
        const regs = await Registration.find({ userId: req.user._id })
            .populate({
                path: 'eventId',
                select: 'title dateStart dateEnd location status category',
                populate: {
                    path: 'createdBy',
                    select: 'name email'
                }
            })
            .sort({ registeredAt: -1 });

        res.json(regs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Cancel registration (Volunteer only)
// DELETE /api/registrations/:eventId/cancel
router.delete('/:eventId/cancel', auth, permit('volunteer'), async (req, res) => {
    try {
        const { eventId } = req.params;

        const registration = await Registration.findOne({
            eventId,
            userId: req.user._id
        });

        if (!registration) {
            return res.status(404).json({ error: 'Registration not found' });
        }

        if (registration.status === 'completed') {
            return res.status(400).json({
                error: 'Cannot cancel completed registration'
            });
        }

        if (registration.status === 'cancelled') {
            return res.status(400).json({
                error: 'Registration already cancelled'
            });
        }

        registration.status = 'cancelled';
        await registration.save();

        // ✅ TẠO NOTIFICATION CHO MANAGER
        const event = await Event.findById(eventId).populate('createdBy');
        if (event && event.createdBy) {
            await Notification.create({
                userId: event.createdBy._id,
                type: 'update',
                title: 'Registration Cancelled',
                message: `${req.user.name} has cancelled their registration for "${event.title}"`,
                relatedEvent: event._id
            });
        }

        res.json({
            ok: true,
            message: 'Registration cancelled successfully',
            registration
        });
    } catch (err) {
        console.error('Cancel registration error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Register for event
// POST /api/registrations/:eventId/register
router.post('/:eventId/register', auth, permit('volunteer'), async (req, res) => {
    try {
        const { eventId } = req.params;

        // 1. Kiểm tra event có tồn tại và đã được approve
        const event = await Event.findById(eventId).populate('createdBy');
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        if (event.status !== 'approved') {
            return res.status(400).json({ error: 'Cannot register for unapproved event' });
        }

        // 2. Kiểm tra event đã qua chưa
        if (new Date() > new Date(event.dateEnd)) {
            return res.status(400).json({ error: 'Cannot register for past events' });
        }

        // 3. Kiểm tra user đã đăng ký chưa
        const existingReg = await Registration.findOne({
            eventId,
            userId: req.user._id
        });

        if (existingReg) {
            if (existingReg.status === 'cancelled' || existingReg.status === 'rejected') {
                existingReg.status = 'pending';
                existingReg.registeredAt = new Date();
                await existingReg.save();

                // ✅ TẠO NOTIFICATION CHO MANAGER - RE-REGISTRATION
                if (event.createdBy) {
                    await Notification.create({
                        userId: event.createdBy._id,
                        type: 'registration',
                        title: 'New Registration Request',
                        message: `${req.user.name} has re-registered for "${event.title}"`,
                        relatedEvent: event._id
                    });
                }

                return res.json({
                    message: 'Re-registered successfully',
                    registration: existingReg
                });
            }

            return res.status(400).json({
                error: `Already ${existingReg.status} for this event`
            });
        }

        // 4. Tạo registration mới với status 'pending'
        const registration = new Registration({
            eventId,
            userId: req.user._id,
            status: 'pending'
        });

        await registration.save();

        // ✅ TẠO NOTIFICATION CHO MANAGER - NEW REGISTRATION
        if (event.createdBy) {
            await Notification.create({
                userId: event.createdBy._id,
                type: 'registration',
                title: 'New Registration Request',
                message: `${req.user.name} has registered for your event "${event.title}"`,
                relatedEvent: event._id
            });
        }

        await registration.populate('eventId', 'title dateStart dateEnd location');

        res.status(201).json({
            message: 'Registration submitted. Waiting for approval.',
            registration
        });

    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ error: err.message });
    }
});

// --- PHẦN DÀNH CHO TỔ CHỨC & ADMIN (Manager/Admin) ---

// Get registrations for an event
// GET /api/registrations/:eventId
router.get('/:eventId', auth, permit('manager', 'admin'), async (req, res) => {
    try {
        const { eventId } = req.params;

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        if (req.user.role === 'manager') {
            if (event.createdBy.toString() !== req.user._id.toString()) {
                return res.status(403).json({ error: 'Forbidden: You do not own this event' });
            }
        }

        const regs = await Registration.find({ eventId })
            .populate('userId', 'name email avatar')
            .sort({ registeredAt: -1 });

        res.json(regs);
    } catch (err) {
        console.error('Get registrations error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Approve registration
// PATCH /api/registrations/:regId/approve
router.patch('/:regId/approve', auth, permit('manager', 'admin'), async (req, res) => {
    try {
        const r = await Registration.findById(req.params.regId)
            .populate('eventId')
            .populate('userId', 'name');

        if (!r) return res.status(404).json({ error: 'Registration not found' });

        if (req.user.role === 'manager') {
            if (!r.eventId || r.eventId.createdBy.toString() !== req.user._id.toString()) {
                return res.status(403).json({ error: 'Forbidden: Ownership check failed' });
            }
        }

        if (r.status === 'completed' || r.status === 'cancelled') {
            return res.status(400).json({
                error: `Cannot approve ${r.status} registration`
            });
        }

        r.status = 'approved';
        await r.save();

        // ✅ TẠO NOTIFICATION CHO VOLUNTEER
        await Notification.create({
            userId: r.userId._id,
            type: 'update',
            title: 'Registration Approved',
            message: `Your registration for "${r.eventId.title}" has been approved!`,
            relatedEvent: r.eventId._id
        });

        res.json({ ok: true, registration: r });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Reject registration
// PATCH /api/registrations/:regId/reject
router.patch('/:regId/reject', auth, permit('manager', 'admin'), async (req, res) => {
    try {
        const r = await Registration.findById(req.params.regId)
            .populate('eventId')
            .populate('userId', 'name');

        if (!r) return res.status(404).json({ error: 'Registration not found' });

        if (req.user.role === 'manager') {
            if (!r.eventId || r.eventId.createdBy.toString() !== req.user._id.toString()) {
                return res.status(403).json({ error: 'Forbidden: Ownership check failed' });
            }
        }

        if (r.status === 'completed') {
            return res.status(400).json({ error: 'Cannot reject completed registration' });
        }

        r.status = 'rejected';
        await r.save();

        // ✅ TẠO NOTIFICATION CHO VOLUNTEER
        await Notification.create({
            userId: r.userId._id,
            type: 'update',
            title: 'Registration Rejected',
            message: `Your registration for "${r.eventId.title}" has been rejected`,
            relatedEvent: r.eventId._id
        });

        res.json({ ok: true, registration: r });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Mark as Completed
// PATCH /api/registrations/:regId/completed
router.patch('/:regId/completed', auth, permit('manager', 'admin'), async (req, res) => {
    try {
        const r = await Registration.findById(req.params.regId)
            .populate('eventId')
            .populate('userId', 'name');

        if (!r) return res.status(404).json({ error: 'Registration not found' });

        if (req.user.role === 'manager') {
            if (!r.eventId || r.eventId.createdBy.toString() !== req.user._id.toString()) {
                return res.status(403).json({ error: 'Forbidden: Ownership check failed' });
            }
        }

        if (r.status !== 'approved') {
            return res.status(400).json({
                error: 'Only approved registrations can be marked as completed'
            });
        }

        r.status = 'completed';
        await r.save();

        // ✅ TẠO NOTIFICATION CHO VOLUNTEER
        await Notification.create({
            userId: r.userId._id,
            type: 'update',
            title: 'Event Completed',
            message: `Thank you for participating in "${r.eventId.title}"!`,
            relatedEvent: r.eventId._id
        });

        res.json({ ok: true, registration: r });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;