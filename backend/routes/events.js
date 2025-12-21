const express = require('express');
const Joi = require('joi');
const Event = require('../models/Event'); // [ĐÃ SỬA] Bỏ comment dòng này
const { auth, permit } = require('../middleware/auth');

const router = express.Router();

const eventSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().allow('').optional(),
  category: Joi.string().allow('').optional(),
  dateStart: Joi.date().required(),
  dateEnd: Joi.date().required(),
  location: Joi.string().allow('').optional()
});

// [CẢI THIỆN] List events (Public view)
// Mặc định chỉ hiển thị các sự kiện ĐÃ ĐƯỢC DUYỆT ('approved')
router.get('/', async (req,res)=>{
  const q = { status: 'approved' }; // Khóa cứng trạng thái approved cho public
  
  if (req.query.category) q.category = req.query.category;
  if (req.query.from) q.dateStart = { $gte: new Date(req.query.from) };

  const events = await Event.find(q)
    .sort({dateStart:1})
    .populate('createdBy', 'name email'); // Hiển thị thêm thông tin tổ chức tạo sự kiện
    
  res.json(events);
});
// xem nhung event ma minh quan ly
router.get('/me', auth, permit('manager', 'admin'), async (req, res) => {
  const events = await Event.find({ createdBy: req.user._id })
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });
  res.json(events);
});
// [CẢI THIỆN] Get single event (Public view)
router.get('/:id', async (req,res)=>{
  const ev = await Event.findById(req.params.id).populate('createdBy', 'name email');
  if (!ev) return res.status(404).json({ error: 'Not found' });

  // Nếu sự kiện chưa được duyệt, người ngoài không được xem
  // (Lưu ý: Nếu muốn cho Manager/Admin xem sự kiện pending, cần thêm middleware auth và check role ở đây)
  if (ev.status !== 'approved') {
      return res.status(404).json({ error: 'Event not found or not publicly available' });
  }

  res.json(ev);
});


// Create event (manager only)
// Khi tạo xong status sẽ là 'pending' chờ admin duyệt
router.post('/', auth, permit('manager','admin'), async (req,res)=>{
  const { error, value } = eventSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.message });
  
  // Gán người tạo là user đang đăng nhập
  const ev = new Event({ ...value, createdBy: req.user._id, status: 'pending' });
  await ev.save();
  res.status(201).json(ev); // Trả về 201 Created
});

// [GHI CHÚ] Các route Approve/Reject đã được di chuyển sang routes/events_admin.js

module.exports = router;

// --- BỔ SUNG CÁC ROUTE CHO MANAGER ---

// Update event (Manager only - and must be OWNER)
// PUT /api/events/:id
router.put('/:id', auth, permit('manager'), async (req, res) => {
    // 1. Validate dữ liệu đầu vào (sử dụng lại schema khi tạo, hoặc tạo schema mới lỏng lẻo hơn nếu cần)
    // Ở đây dùng lại schema tạo để đảm bảo dữ liệu chuẩn.
    const { error, value } = eventSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ error: 'Event not found' });

        // 2. [QUAN TRỌNG] Kiểm tra quyền sở hữu
        if (event.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Forbidden: You do not own this event' });
        }

        // 3. Cập nhật thông tin
        // Lưu ý: Không cho phép cập nhật các trường hệ thống như createdBy, attendeesCount, createdAt ở đây.
        // Tùy nghiệp vụ: nếu sửa thông tin quan trọng, có thể cần reset status về 'pending' để admin duyệt lại.
        // Ví dụ này giữ nguyên status cũ.
        Object.assign(event, value); 
        
        // Đảm bảo không bị ghi đè các trường nhạy cảm nếu hacker cố tình gửi lên
        event.createdBy = req.user._id; 
        
        await event.save();
        res.json(event);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete event (Manager only - and must be OWNER)
// DELETE /api/events/:id
router.delete('/:id', auth, permit('manager'), async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ error: 'Event not found' });

        // 1. [QUAN TRỌNG] Kiểm tra quyền sở hữu
        if (event.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Forbidden: You do not own this event' });
        }

        // 2. Xóa sự kiện
        // LƯU Ý QUAN TRỌNG: Khi xóa sự kiện, cần cân nhắc xử lý các Registration liên quan.
        // Cách 1 (Đơn giản): Xóa luôn các registration liên quan.
        // Cách 2 (An toàn hơn): Chỉ cho xóa nếu chưa có ai đăng ký (attendeesCount === 0).
        // Dưới đây là ví dụ Cách 1 (sử dụng pre hook trong model Event sẽ tốt hơn, nhưng viết ở đây cho nhanh gọn):
        await Registration.deleteMany({ eventId: event._id });
        await event.remove(); // Hoặc await Event.findByIdAndDelete(req.params.id);

        res.json({ ok: true, message: 'Event and related registrations deleted' });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// module.exports = router; // Dòng này đã có sẵn ở cuối file của bạn