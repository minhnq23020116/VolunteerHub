const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

//module.exports = mongoose.model('Post', postSchema);
// Dòng mới đã sửa lỗi:
// Kiểm tra xem mongoose.models.User đã tồn tại chưa. Nếu có rồi (||) thì dùng cái cũ. Nếu chưa thì tạo mới.
module.exports = mongoose.models.User || mongoose.model('Post', postSchema);