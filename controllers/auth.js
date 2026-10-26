const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const { email, name, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      email,
      password: hashedPassword,
      name,
    });
    await user.save();
    res
      .status(201)
      .json({ message: 'User created!', userId: user._id.toString() });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error('A user could not be found');
    error.statusCode = 401;
    throw error;
  }
  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    const error = new Error('Wrong password');
    error.statusCode = 401;
    throw error;
  }
  const token = jwt.sign(
    {
      email: user.email,
      userId: user._id.toString(),
    },
    process.env.SESSION_SECRET_KEY,
    { expiresIn: '1h' },
  );
  res.status(200).json({ token, userId: user._id.toString() });
};

exports.getStatus = async (req, res, next) => {
  const user = await User.findById(req.userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  res.status(200).json({ message: 'User status found!', status: user.status });
};

exports.updateStatus = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.statusCode = 422;
    throw error;
  }
  const newStatus = req.body.status;
  const user = await User.findById(req.userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  user.status = newStatus;
  await user.save();

  res.status(200).json({ message: 'User status updated!' });
};
