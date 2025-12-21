const express = require('express');
const { auth } = require('../middleware/auth');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Event = require('../models/Event');

const router = express.Router();

/**
 * @route   GET /api/posts
 * @desc    Lấy tất cả bài viết cho trang Feed chung (Community Updates)
 */
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('authorId', 'name avatar') // Lấy tên và ảnh đại diện
            .populate('eventId', 'title')       // Lấy tên sự kiện để hiển thị
            .sort({ createdAt: -1 });           // Sắp xếp bài mới nhất lên đầu
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @route   POST /api/posts
 * @desc    Tạo bài viết mới (Đã sửa để khớp với body từ Feed.tsx)
 */
router.post('/', auth, async (req, res) => {
    try {
        const { eventId, content } = req.body; // Lấy dữ liệu từ body thay vì params

        // Kiểm tra sự kiện có tồn tại và đã được duyệt không
        const event = await Event.findById(eventId);
        if (!event || event.status !== 'approved') {
            return res.status(400).json({ error: 'Event not available for posts' });
        }

        const newPost = new Post({
            eventId: event._id,
            authorId: req.user._id,
            content: content
        });

        await newPost.save();
        res.json(newPost);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @route   GET /api/posts/:eventId/posts
 * @desc    Lấy bài viết theo từng sự kiện cụ thể
 */
router.get('/:eventId/posts', async (req, res) => {
    try {
        const posts = await Post.find({ eventId: req.params.eventId })
            .populate('authorId', 'name');
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @route   POST /api/posts/post/:postId/comment
 * @desc    Thêm bình luận vào bài viết
 */
router.post('/post/:postId/comment', auth, async (req, res) => {
    try {
        const comment = new Comment({
            postId: req.params.postId,
            authorId: req.user._id,
            content: req.body.content
        });

        await comment.save();
        res.json(comment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @route   POST /api/posts/post/:postId/like
 * @desc    Like hoặc Unlike bài viết
 */
router.post('/post/:postId/like', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        const idx = post.likes.findIndex(id => id.equals(req.user._id));

        if (idx === -1) {
            post.likes.push(req.user._id); // Like
        } else {
            post.likes.splice(idx, 1);     // Unlike
        }

        await post.save();
        res.json({ ok: true, likesCount: post.likes.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;