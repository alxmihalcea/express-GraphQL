require('dotenv').config();
const requiredEnv = ['DB_PASSWORD', 'SESSION_SECRET_KEY'];
for (const key of requiredEnv) {
  if (!process.env[key]) throw new Error(`${key} is not set`);
}

const path = require('path');
const multer = require('multer');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');

const mongoDbPassword = encodeURIComponent(process.env.DB_PASSWORD);
const MONGODB_URI = `mongodb+srv://alex:${mongoDbPassword}@cluster0.gddgznl.mongodb.net/messages?appName=Cluster0`;

const app = express();

const fileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'images');
  },
  filename: function (req, file, cb) {
    cb(null, uuidv4());
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(bodyParser.json()); // application/json
app.use(
  multer({
    storage: fileStorage,
    fileFilter,
  }).single('image'),
);
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, DELETE, PATCH',
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message, data });
});

mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    const server = app.listen(8080);
    const io = require('./socket').init(server);
    io.on('connection', (socket) => {
      console.log('Client connected');
    });
  })
  .catch((err) => console.log(err));
