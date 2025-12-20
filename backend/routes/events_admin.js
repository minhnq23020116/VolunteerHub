const express = require('express');
const Event = require('../models/Event');
const Registration = require('../models/Registration'); // Cần import để xóa registrations liên quan
const { auth, permit } = require('../middleware/auth');

const router = express.Router();

// Middleware chung: Tất cả các route trong file này đều yêu cầu quyền 'admin'
router.use(auth, permit('admin'));

// Lấy danh sách tất cả sự kiện (bao gồm pending/rejected) để quản lý
router.get('/all', async (req, res) => {
  try {
    const q = {};
    if (req.query.status) q.status = req.query.status; // Admin được phép lọc theo status
    
    const events = await Event.find(q)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email');
    
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Approve event
router.patch('/:id/approve', async (req, res) => {
  try {
    const ev = await Event.findById(req.params.id);
    if (!ev) return res.status(404).json({ error: 'Event not found' });
    
    ev.status = 'approved';
    await ev.save();
    
    // Populate createdBy trước khi trả về
    await ev.populate('createdBy', 'name email');
    
    res.json(ev);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reject event
router.patch('/:id/reject', async (req, res) => {
  try {
    const ev = await Event.findById(req.params.id);
    if (!ev) return res.status(404).json({ error: 'Event not found' });
    
    ev.status = 'rejected';
    await ev.save();
    
    // Populate createdBy trước khi trả về
    await ev.populate('createdBy', 'name email');
    
    res.json(ev);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete event (Admin có quyền xóa bất kỳ event nào)
router.delete('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    // Xóa các registration liên quan trước
    await Registration.deleteMany({ eventId: event._id });
    
    // Xóa sự kiện
    await Event.findByIdAndDelete(req.params.id);

    res.json({ 
      ok: true, 
      message: 'Event and related registrations deleted successfully' 
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;