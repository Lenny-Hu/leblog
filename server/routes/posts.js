const express = require('express');
const router = express.Router();
const Joi = require('joi');
const moment = require('moment');

const checkLogin = require('../middlewares/auth').checkLogin;
const Article = require('../db/article');
const Comment = require('../db/comments');

const utils = require('../lib/utils');

// GET /posts 所有用户或者特定用户的文章页
//   eg: GET /posts?creator=xxx
router.get('/', function (req, res, next) {
  Article.find(req.query, function (err, results) {
    if (err) {
      return next(err);
    }
    return res.render('posts', {articles: results, moment: moment});
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

    // 发表成功，跳转到文章详情页
    req.flash('success', '发表成功');
    res.redirect(`/posts/${doc._id}`);
  })
});

// GET /posts/create 发表文章页
router.get('/create', checkLogin, function (req, res, next) {
  res.render('create');
});

// GET /posts/:articleId 单独一篇的文章页
router.get('/:articleId', function (req, res, next) {
  if (!req.params.articleId) {
    return next('非法的参数');
  }

  Article.findById(req.params.articleId, function (err, doc) {
    if (err) {
      return next(err);
    }
    // 增加文章浏览数
    Article.incPv(doc._id, function (err) {
      if (err) {
        console.log(`更新文章浏览数失败：${err}`);
      }
    });

    // 获取该文章的评论列表
    Comment.find({article: doc._id}, function (err, comments) {
      if (err) {
        return next(err);
      }

      return res.render('post', {article: doc, comments: comments, moment: moment});
    });
  })
});

// GET /posts/:articleId/edit 更新文章页
router.get('/:articleId/edit', checkLogin, function (req, res, next) {
  if (!req.params.articleId) {
    return next('非法的参数');
  }

  Article.findById(req.params.articleId, function (err, doc) {
    if (err) {
      return next(err);
    }
    // 检查用户
    if (req.session.user._id.toString() !== doc.creator._id.toString()) {
      return next('权限不足');
    }

    return res.render('edit', {article: doc});
  })
});

// POST /posts/:articleId/edit 更新一篇文章
router.post('/:articleId/edit', checkLogin, function (req, res, next) {
  if (!req.params.articleId) {
    return next('非法的参数');
  }

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

  Article.update(req.session.user, req.params.articleId, req.body, function (err, result) {
    if (err) {
      req.flash('error', `更新文章失败：${err}`);
      return res.redirect('back');
    }
    console.log('更新结果', result);
    // 发表成功，跳转到文章详情页
    req.flash('success', '更新文章成功');
    res.redirect(`/posts/${req.params.articleId}`);
  })
});

// GET /posts/:articleId/remove 删除一篇文章
router.get('/:articleId/remove', checkLogin, function (req, res, next) {
  if (!req.params.articleId) {
    return next('非法的参数');
  }

  Article.remove(req.session.user, req.params.articleId, function (err, result) {
    if (err) {
      return next(err);
    }
    console.log('删除结果', result);
    // 删除留言
    if (result.ok && result.n > 0) {
      Comment.removeByArticleId(req.params.articleId, function (err) {
        if (err) {
          console.log(`删除文章《${req.params.articleId}》的评论失败：${err}`);
        }
      })
    }

    // 删除成功后，跳转到文章列表页面
    req.flash('success', '删除文章成功');
    res.redirect('/posts');
  })
});

module.exports = router;
