const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth');

// GET /signout 登出
router.get('/', auth.checkLogin, function (req, res, next) {
  // 清空session中的用户信息
  req.session.user = null;
  req.flash('success', '登出成功');
  // 跳转到主页
  res.redirect('/posts');
});

module.exports = router;
