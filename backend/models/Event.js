const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  category: String,
  dateStart: Date,
  dateEnd: Date,
  location: String,
  status: { type: String, enum: ['pending','approved','rejected'], default: 'pending' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  attendeesCount: { type: Number, default: 0 }
});

//module.exports = mongoose.model('Event', eventSchema);
// Dòng mới đã sửa lỗi:
// Kiểm tra xem mongoose.models.User đã tồn tại chưa. Nếu có rồi (||) thì dùng cái cũ. Nếu chưa thì tạo mới.
module.exports = mongoose.models.User || mongoose.model('Event', eventSchema);