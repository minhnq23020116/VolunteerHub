const express = require('express');
const { auth, permit } = require('../middleware/auth');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Event = require('../models/Event');

const router = express.Router();

// create post (only when event approved)
router.post('/:eventId/posts', auth, async (req,res)=>{
const event = await Event.findById(req.params.eventId);
  // [QUAN TRỌNG] Kiểm tra status là approved. Rất tốt!
if (!event || event.status !== 'approved') return res.status(400).json({ error: 'Event not available for posts' });
  // ... logic lưu bài viết ...

  const p = new Post({ eventId: event._id, authorId: req.user._id, content: req.body.content });
  await p.save();
  res.json(p);
});

// get posts for event
router.get('/:eventId/posts', async (req,res)=>{
  const posts = await Post.find({ eventId: req.params.eventId }).populate('authorId','name');
  res.json(posts);
});

// comment
router.post('/post/:postId/comment', auth, async (req,res)=>{
  const c = new Comment({ postId: req.params.postId, authorId: req.user._id, content: req.body.content });
  await c.save();
  res.json(c);
});

// like/unlike
router.post('/post/:postId/like', auth, async (req,res)=>{
  const post = await Post.findById(req.params.postId);
  if (!post) return res.status(404).json({ error: 'Not found' });
  const idx = post.likes.findIndex(id=>id.equals(req.user._id));
  if (idx === -1) {
    post.likes.push(req.user._id);
  } else {
    post.likes.splice(idx,1);
  }
  await post.save();
  res.json({ ok: true, likesCount: post.likes.length });
});

module.exports = router;
