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

// [ĐÃ SỬA] Sửa từ mongoose.models.User → mongoose.models.Event
module.exports = mongoose.models.Event || mongoose.model('Event', eventSchema);