const express = require('express');
const { auth, permit } = require('../middleware/auth');
const Registration = require('../models/Registration');
const Event = require('../models/Event');

const router = express.Router();

// --- PHẦN DÀNH CHO TÌNH NGUYỆN VIÊN (Volunteer) ---

// [MỚI - BỔ SUNG] Get my registration history
// GET /api/registrations/me/history
// *** ĐẶT ROUTE NÀY LÊN TRƯỚC ROUTE GET /:eventId ***
router.get('/me/history', auth, permit('volunteer'), async (req, res) => {
    try {
        // Tìm tất cả registration của user hiện tại
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


// ... (Giữ nguyên các route register và cancel cũ của bạn ở đây) ...
// router.post('/:eventId/register', ...)

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
// router.post('/:eventId/cancel', ...)


// --- PHẦN DÀNH CHO TỔ CHỨC & ADMIN (Manager/Admin) ---

// ... (Giữ nguyên route GET /:eventId cũ của bạn ở đây) ...
// router.get('/:eventId', ...)


// ... (Giữ nguyên route PATCH /:regId/approve cũ của bạn ở đây) ...
// router.patch('/:regId/approve', ...)


// [MỚI - BỔ SUNG] Reject registration
// PATCH /api/registrations/:regId/reject
router.patch('/:regId/reject', auth, permit('manager', 'admin'), async (req, res) => {
    // Logic tương tự như approve, chỉ khác status
    const r = await Registration.findById(req.params.regId).populate('eventId');
    if (!r) return res.status(404).json({ error: 'Registration not found' });

    // Ownership Check (Nếu là Manager)
    if (req.user.role === 'manager') {
        if (!r.eventId || r.eventId.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Forbidden: Ownership check failed' });
        }
    }

    // Không cho phép reject nếu đã completed
    if (r.status === 'completed') return res.status(400).json({error: 'Cannot reject completed registration'});

    r.status = 'rejected';
    await r.save();
    // TODO: notify volunteer
    res.json({ ok: true, registration: r });
});

// [MỚI - BỔ SUNG] Mark as Completed (Sau khi sự kiện kết thúc)
// PATCH /api/registrations/:regId/completed
router.patch('/:regId/completed', auth, permit('manager', 'admin'), async (req, res) => {
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
         return res.status(400).json({ error: 'Only approved registrations can be marked as completed' });
     }

     // (Tùy chọn) Kiểm tra xem sự kiện đã kết thúc chưa (dựa vào eventId.dateEnd)

     r.status = 'completed';
     await r.save();
     // TODO: notify volunteer & maybe award points
     res.json({ ok: true, registration: r });
 });

module.exports = router;