const mongoose = require('mongoose');

const regSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending','approved','rejected','cancelled','completed'], default: 'pending' },
  registeredAt: { type: Date, default: Date.now }
});

regSchema.index({ eventId: 1, userId: 1 }, { unique: true });

//module.exports = mongoose.model('Registration', regSchema);
// Dòng mới đã sửa lỗi:
// Kiểm tra xem mongoose.models.User đã tồn tại chưa. Nếu có rồi (||) thì dùng cái cũ. Nếu chưa thì tạo mới.
module.exports = mongoose.models.User || mongoose.model('Registration', regSchema);