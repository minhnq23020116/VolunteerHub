const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const User = require('../models/User');

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

module.exports = router;
