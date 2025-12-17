const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

//module.exports = mongoose.model('Comment', commentSchema);
// Dòng mới đã sửa lỗi:
// Kiểm tra xem mongoose.models.User đã tồn tại chưa. Nếu có rồi (||) thì dùng cái cũ. Nếu chưa thì tạo mới.
module.exports = mongoose.models.User || mongoose.model('Comment', commentSchema);