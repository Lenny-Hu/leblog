const express = require('express');
const router = express.Router();
const Joi = require('joi');

const checkLogin = require('../middlewares/auth').checkLogin;
const Article = require('../db/article');

const utils = require('../lib/utils');

// GET /posts 所有用户或者特定用户的文章页
//   eg: GET /posts?creator=xxx
router.get('/', function (req, res, next) {
  Article.find(req.query, function (err, results) {
    if (err) {
      return next(err);
    }
    return res.render('posts', {articles: results});
  })
});

// POST /posts/create 发表一篇文章
router.post('/create', checkLogin, function (req, res, next) {
  // 校验参数
  let schema = Joi.object().keys({
    title: Joi.string().trim().required(),
    content: Joi.string().trim().required(),
  }).required();

  let validateResult = Joi.validate(req.body, schema);
  if (validateResult.error) {
    // 错误消息
    let errmsg = '表单参数错误：' + utils.getValidateErrmsg(validateResult.error.details);
    req.flash('error', errmsg);
    return res.redirect('back');
  }

  // 添加作者
  req.body.creator = req.session.user._id;

  Article.add(req.body, function (err, doc) {
    if (err) {
      req.flash('error', `发表文章失败：${err}`);
      return res.redirect('back');
    }

    // 发表成功，跳转到首页
    req.flash('success', '发表成功');
    res.redirect(`/posts/${doc._id}`);
  })
});

// GET /posts/create 发表文章页
router.get('/create', checkLogin, function (req, res, next) {
  res.render('create');
});

// GET /posts/:postId 单独一篇的文章页
router.get('/:postId', function (req, res, next) {
  res.send('文章详情页');
});

// GET /posts/:postId/edit 更新文章页
router.get('/:postId/edit', checkLogin, function (req, res, next) {
  res.send('更新文章页');
});

// POST /posts/:postId/edit 更新一篇文章
router.post('/:postId/edit', checkLogin, function (req, res, next) {
  res.send('更新文章');
});

// GET /posts/:postId/remove 删除一篇文章
router.get('/:postId/remove', checkLogin, function (req, res, next) {
  res.send('删除文章');
});

module.exports = router;
