const express = require('express');
const { auth, permit } = require('../middleware/auth');
const Registration = require('../models/Registration');
const Event = require('../models/Event');

const router = express.Router();

// --- PHẦN DÀNH CHO TÌNH NGUYỆN VIÊN (Volunteer) ---

// Get my registration history
// GET /api/registrations/me/history
// *** ĐẶT ROUTE NÀY LÊN TRƯỚC ROUTE GET /:eventId ***
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
        
        // Tìm registration của user cho event này
        const registration = await Registration.findOne({
            eventId,
            userId: req.user._id
        });

        if (!registration) {
            return res.status(404).json({ error: 'Registration not found' });
        }

        // Chỉ cho phép cancel nếu đang pending hoặc approved
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

        // Đánh dấu là cancelled
        registration.status = 'cancelled';
        await registration.save();

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
        const event = await Event.findById(eventId);
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
            // Nếu đã cancel/reject trước đó, cho phép đăng ký lại
            if (existingReg.status === 'cancelled' || existingReg.status === 'rejected') {
                existingReg.status = 'pending';
                existingReg.registeredAt = new Date();
                await existingReg.save();

                return res.json({ 
                    message: 'Re-registered successfully', 
                    registration: existingReg 
                });
            }

            // Nếu đang pending, approved hoặc completed
            return res.status(400).json({ 
                error: `Already ${existingReg.status} for this event` 
            });
        }

        // 4. Tạo registration mới với status 'pending' (chờ manager approve)
        const registration = new Registration({
            eventId,
            userId: req.user._id,
            status: 'pending'
        });

        await registration.save();

        // Populate để trả về đầy đủ thông tin
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

// [MỚI - BỔ SUNG] Get registrations for an event
// GET /api/registrations/:eventId
// *** ĐẶT ROUTE NÀY SAU /me/history ***
router.get('/:eventId', auth, permit('manager', 'admin'), async (req, res) => {
    try {
        const { eventId } = req.params;

        // Kiểm tra event có tồn tại
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // Ownership Check (Nếu là Manager - chỉ xem event của mình)
        if (req.user.role === 'manager') {
            if (event.createdBy.toString() !== req.user._id.toString()) {
                return res.status(403).json({ error: 'Forbidden: You do not own this event' });
            }
        }

        // Lấy tất cả registrations của event
        const regs = await Registration.find({ eventId })
            .populate('userId', 'name email avatar')
            .sort({ registeredAt: -1 });
        
        res.json(regs);
    } catch (err) {
        console.error('Get registrations error:', err);
        res.status(500).json({ error: err.message });
    }
});

// [MỚI - BỔ SUNG] Approve registration
// PATCH /api/registrations/:regId/approve
router.patch('/:regId/approve', auth, permit('manager', 'admin'), async (req, res) => {
    try {
        const r = await Registration.findById(req.params.regId).populate('eventId');
        if (!r) return res.status(404).json({ error: 'Registration not found' });

        // Ownership Check (Nếu là Manager)
        if (req.user.role === 'manager') {
            if (!r.eventId || r.eventId.createdBy.toString() !== req.user._id.toString()) {
                return res.status(403).json({ error: 'Forbidden: Ownership check failed' });
            }
        }

        // Không cho phép approve nếu đã completed hoặc cancelled
        if (r.status === 'completed' || r.status === 'cancelled') {
            return res.status(400).json({ 
                error: `Cannot approve ${r.status} registration` 
            });
        }

        r.status = 'approved';
        await r.save();
        
        // TODO: notify volunteer
        res.json({ ok: true, registration: r });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// [MỚI - BỔ SUNG] Reject registration
// PATCH /api/registrations/:regId/reject
router.patch('/:regId/reject', auth, permit('manager', 'admin'), async (req, res) => {
    try {
        const r = await Registration.findById(req.params.regId).populate('eventId');
        if (!r) return res.status(404).json({ error: 'Registration not found' });

        // Ownership Check (Nếu là Manager)
        if (req.user.role === 'manager') {
            if (!r.eventId || r.eventId.createdBy.toString() !== req.user._id.toString()) {
                return res.status(403).json({ error: 'Forbidden: Ownership check failed' });
            }
        }

        // Không cho phép reject nếu đã completed
        if (r.status === 'completed') {
            return res.status(400).json({ error: 'Cannot reject completed registration' });
        }

        r.status = 'rejected';
        await r.save();
        
        // TODO: notify volunteer
        res.json({ ok: true, registration: r });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// [MỚI - BỔ SUNG] Mark as Completed (Sau khi sự kiện kết thúc)
// PATCH /api/registrations/:regId/completed
router.patch('/:regId/completed', auth, permit('manager', 'admin'), async (req, res) => {
    try {
        const r = await Registration.findById(req.params.regId).populate('eventId');
        if (!r) return res.status(404).json({ error: 'Registration not found' });

        // Ownership Check
        if (req.user.role === 'manager') {
            if (!r.eventId || r.eventId.createdBy.toString() !== req.user._id.toString()) {
                return res.status(403).json({ error: 'Forbidden: Ownership check failed' });
            }
        }

        // Chỉ đánh dấu hoàn thành cho các đơn đã được duyệt
        if (r.status !== 'approved') {
            return res.status(400).json({ 
                error: 'Only approved registrations can be marked as completed' 
            });
        }

        // (Tùy chọn) Kiểm tra xem sự kiện đã kết thúc chưa
        // if (new Date() < new Date(r.eventId.dateEnd)) {
        //     return res.status(400).json({ error: 'Event has not ended yet' });
        // }

        r.status = 'completed';
        await r.save();
        
        // TODO: notify volunteer & maybe award points
        res.json({ ok: true, registration: r });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;