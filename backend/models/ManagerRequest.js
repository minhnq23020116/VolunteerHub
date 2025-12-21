// File để Admin quản lý người dùng (UserManager
const mongoose = require('mongoose');

const managerRequestSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    organization: { type: String, required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.ManagerRequest || mongoose.model('ManagerRequest', managerRequestSchema);