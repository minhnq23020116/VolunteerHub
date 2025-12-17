const express = require('express');
const Event = require('../models/Event');
const { auth, permit } = require('../middleware/auth');

const router = express.Router();

// Middleware chung: Tất cả các route trong file này đều yêu cầu quyền 'admin'
router.use(auth, permit('admin'));

// Lấy danh sách tất cả sự kiện (bao gồm pending/rejected) để quản lý
router.get('/all', async (req, res) => {
    const q = {};
    if (req.query.status) q.status = req.query.status; // Admin được phép lọc theo status
    const events = await Event.find(q).sort({ createdAt: -1 }).populate('createdBy', 'name email');
    res.json(events);
});

// Approve event
router.patch('/:id/approve', async (req,res)=>{ // Dùng PATCH hợp lý hơn POST cho việc cập nhật 1 phần
  const ev = await Event.findById(req.params.id);
  if (!ev) return res.status(404).json({ error: 'Not found' });
  ev.status = 'approved';
  await ev.save();
  res.json(ev);
});

// Reject event
router.patch('/:id/reject', async (req,res)=>{
  const ev = await Event.findById(req.params.id);
  if (!ev) return res.status(404).json({ error: 'Not found' });
  ev.status = 'rejected';
  await ev.save();
  res.json(ev);
});

module.exports = router;