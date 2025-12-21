const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['volunteer','manager','admin'], default: 'volunteer' },
    isLocked: { type: Boolean, default: false },
    bio: { type: String, default: '' },
    avatar: { type: String, default: '' },
    hoursVolunteered: { type: Number, default: 0 },
    eventsAttended: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

//module.exports = mongoose.model('User', userSchema);
// Dòng mới đã sửa lỗi:
// Kiểm tra xem mongoose.models.User đã tồn tại chưa. Nếu có rồi (||) thì dùng cái cũ. Nếu chưa thì tạo mới.
module.exports = mongoose.models.User || mongoose.model('User', userSchema);