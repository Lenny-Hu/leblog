const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth');

// GET /signout 登出
router.get('/', auth.checkLogin, function (req, res, next) {
  res.send('登出');
});

module.exports = router;
