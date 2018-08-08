const express = require('express');
const router = express.Router();
const sha1 = require('sha1');
const Joi = require('joi');
const _ = require('lodash');
const passport = require('passport');

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
    // 错误消息
    let errmsg = '表单参数错误：' + utils.getValidateErrmsg(validateResult.error.details);
    req.flash('error', errmsg);
    return res.redirect('back');
  }
  // 移除空格一类的
  req.body.name = _.trim(req.body.name);
  req.body.password = _.trim(req.body.password);

  // 照顾下passport插件，它用的username
  req.body.username = req.body.name;

  next();

}, passport.authenticate('local', {successRedirect: '/posts', failureRedirect: '/signin', failureFlash: true}));

module.exports = router;
