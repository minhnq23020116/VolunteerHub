const mongoose = require('mongoose');

const regSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending','approved','rejected','cancelled','completed'], default: 'pending' },
  registeredAt: { type: Date, default: Date.now }
});

regSchema.index({ eventId: 1, userId: 1 }, { unique: true });

// ✅ SỬA: Kiểm tra đúng model Registration
module.exports = mongoose.models.Registration || mongoose.model('Registration', regSchema);