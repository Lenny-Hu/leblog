const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');

// POST /comments 创建一条留言
router.post('/', auth.checkLogin, function (req, res, next) {
  res.send('创建留言');
});

// GET /comments/:commentId/remove 删除一条留言
router.get('/:commentId/remove', auth.checkLogin, function (req, res, next) {
  res.send('删除留言');
});

module.exports = router;
