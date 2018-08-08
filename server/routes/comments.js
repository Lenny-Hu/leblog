const express = require('express');
const Joi = require('joi');
const router = express.Router();
const auth = require('../middlewares/auth');
const Article = require('../db/article');
const Comment = require('../db/comments');
const utils = require('../lib/utils');

// POST /comments 创建一条留言
router.post('/', auth.checkLogin, function (req, res, next) {
  // 校验参数
  let schema = Joi.object().keys({
    articleId: Joi.string().trim().required(),
    content: Joi.string().trim().required()
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
  req.body.article = req.body.articleId;
  delete req.body.articleId;

  Comment.add(req.body, function (err, doc) {
    if (err) {
      req.flash('error', `发表失败：${err}`);
      return res.redirect('back');
    }

    // 更新文章评论数
    Article.incCommentCount(req.body.article, 1, function (err) {
      if (err) {
        console.log(`更新文章《${req.body.article}》的评论数失败：${err}`);
      }
    });

    // 发表成功，跳转到文章详情页
    req.flash('success', '发表成功');
    res.redirect('back');
  })

});

// GET /comments/:commentId/remove 删除一条留言
router.get('/:commentId/remove', auth.checkLogin, function (req, res, next) {
  if (!req.params.commentId) {
    return next('非法的参数');
  }

  Comment.findOneAndRemove(req.session.user, req.params.commentId, function (err, doc) {
    if (err) {
      return next(err);
    }
    console.log('删除结果', doc);
    // 更新文章的评论数
    if (doc) {
      Article.incCommentCount(doc.article, -1, function (err, result) {
        if (err) {
          console.log(`更新文章《${doc.article}》的评论数失败：${err}`);
        }
      })
    }

    // 删除成功后，返回上一页
    req.flash('success', '删除成功');
    res.redirect('back');
  })
});

module.exports = router;
