const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

const registerSchema = Joi.object({
    name: Joi.string().min(2).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('volunteer','manager').default('volunteer')
});

router.post('/register', async (req,res)=>{
    const { error, value } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });
    const { name, email, password, role } = value;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already used' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({ name, email, passwordHash, role });
    await user.save();
    return res.json({ ok: true, id: user._id });
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

router.post('/login', async (req,res)=>{
    const { error, value } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });
    const user = await User.findOne({ email: value.email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(value.password, user.passwordHash);
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, user: { id: user._id, email: user.email, name: user.name, role: user.role } });
});

// GET /api/auth/me - Lấy thông tin user hiện tại
router.get('/me', auth, async (req, res) => {
    try {
        res.json({
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
            isLocked: req.user.isLocked,
            createdAt: req.user.createdAt,
            bio: req.user.bio,
            avatar: req.user.avatar
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/auth/me - Cập nhật thông tin user
router.put('/me', auth, async (req, res) => {
    try {
        const { name, email, bio, avatar } = req.body;

        // Validate input
        if (!name || name.trim().length < 2) {
            return res.status(400).json({ error: 'Name must be at least 2 characters' });
        }

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Kiểm tra email đã tồn tại chưa (trừ email của chính user)
        const existingUser = await User.findOne({
            email,
            _id: { $ne: req.user._id }
        });

        if (existingUser) {
            return res.status(400).json({ error: 'Email already in use' });
        }

        // Cập nhật user
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            {
                name: name.trim(),
                email: email.trim(),
                bio: bio?.trim() || '',
                avatar: avatar || ''
            },
            { new: true, runValidators: true }
        ).select('-passwordHash');

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            isLocked: updatedUser.isLocked,
            createdAt: updatedUser.createdAt,
            bio: updatedUser.bio,
            avatar: updatedUser.avatar
        });

    } catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/auth/me - Xóa tài khoản
router.delete('/me', auth, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.user._id);
        res.json({ message: 'Account deleted successfully' });
    } catch (err) {
        console.error('Delete account error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;