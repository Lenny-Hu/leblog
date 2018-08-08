const express = require('express');
const router = express.Router();
const sha1 = require('sha1');
const Joi = require('joi');
const _ = require('lodash');

const auth = require('../middlewares/auth');
const User = require('../db/user');

const utils = require('../lib/utils');

// GET /signin 登录页
router.get('/', auth.checkNotLogin, function (req, res, next) {
  res.render('signin');
});

// POST /signin 用户登录
router.post('/', auth.checkNotLogin, function (req, res, next) {
  // 校验参数
  let schema = Joi.object().keys({
    name: Joi.string().trim().min(1).max(10).required(),
    password: Joi.string().trim().min(6).required(),
  }).required();

  let validateResult = Joi.validate(req.body, schema);
  if (validateResult.error) {
    console.log(validateResult.error);
    // 错误消息
    let errmsg = '表单参数错误：' + utils.getValidateErrmsg(validateResult.error.details);
    req.flash('error', errmsg);
    return res.redirect('back');
  }
  // 移除空格一类的
  req.body.name = _.trim(req.body.name);
  req.body.password = _.trim(req.body.password);

  // 查找用户信息
  User.getUserByName(req.body.name, function (err, doc) {
    console.log('找到的用户信息', err, doc);
    if (err || !doc) {
      req.flash('error', err || '没有找到用户');
      return res.redirect('back');
    }

    // 检查用户名和密码
    if (sha1(req.body.password) !== doc.password) {
      req.flash('error', '用户名或密码错误');
      return res.redirect('back');
    }

    // 登录成功，写入session，跳转到主页
    req.flash('success', '登录成功');
    delete doc.password;

    req.session.user = doc;
    res.redirect('/posts');

  })
});

module.exports = router;
