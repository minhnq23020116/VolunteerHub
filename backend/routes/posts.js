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
        // Cách đơn giản nhất là map qua các post và lấy comment của chúng
        const postsWithComments = await Promise.all(posts.map(async (post) => {
            const comments = await Comment.find({ postId: post._id }).populate('authorId', 'name');
            return { ...post._doc, comments }; // Gộp comments vào object post
        }));

        res.json(postsWithComments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Thêm route mới /feed vào posts.js (giữ nguyên route GET / cũ)

// Get posts for feed (filtered based on user role and permissions)
router.get('/feed', auth, async (req, res) => {
  try {
    const Registration = require('../models/Registration');
    const Event = require('../models/Event');
    const Comment = require('../models/Comment');
    
    let visibleEventIds = [];

    // 1. Admin: See all posts
    if (req.user.role === 'admin') {
      const allPosts = await Post.find()
        .populate('authorId', 'name avatar')
        .populate('eventId', 'title')
        .sort({ createdAt: -1 });
      
      // Fetch comments for each post
      const postsWithComments = await Promise.all(allPosts.map(async (post) => {
        const comments = await Comment.find({ postId: post._id })
          .populate('authorId', 'name avatar')
          .sort({ createdAt: 1 });
        return { ...post._doc, comments };
      }));
      
      return res.json(postsWithComments);
    }

    // 2. Manager: See posts from events they own
    if (req.user.role === 'manager') {
      const ownedEvents = await Event.find({ createdBy: req.user._id }).select('_id');
      visibleEventIds = ownedEvents.map(e => e._id.toString());
    }

    // 3. Volunteer: See posts from events they have approved/completed registrations
    if (req.user.role === 'volunteer') {
      const myRegistrations = await Registration.find({
        userId: req.user._id,
        status: { $in: ['approved', 'completed'] }
      }).select('eventId');
      
      visibleEventIds = myRegistrations.map(r => r.eventId.toString());
    }

    // 4. Fetch posts for visible events
    const posts = await Post.find({ 
      eventId: { $in: visibleEventIds } 
    })
      .populate('authorId', 'name avatar')
      .populate('eventId', 'title')
      .sort({ createdAt: -1 });

    // 5. Fetch comments for each post
    const postsWithComments = await Promise.all(posts.map(async (post) => {
      const comments = await Comment.find({ postId: post._id })
        .populate('authorId', 'name avatar')
        .sort({ createdAt: 1 });
      return { ...post._doc, comments };
    }));

    res.json(postsWithComments);
  } catch (err) {
    console.error('Get posts error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Route GET / cũ giữ nguyên cho public view
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
// routes/posts.js
router.post('/post/:postId/like', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        const idx = post.likes.findIndex(id => id.equals(req.user._id));

        if (idx === -1) {
            post.likes.push(req.user._id);
        } else {
            post.likes.splice(idx, 1);
        }

        await post.save();
        // QUAN TRỌNG: Trả về mảng likes để Frontend không bị crash
        res.json({ ok: true, likes: post.likes });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;