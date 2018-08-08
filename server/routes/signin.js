const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth');

// GET /signin 登录页
router.get('/', auth.checkNotLogin, function (req, res, next) {
  res.send('登录页');
});

// POST /signin 用户登录
router.post('/', auth.checkNotLogin, function (req, res, next) {
  res.send('登录');
});

module.exports = router;
