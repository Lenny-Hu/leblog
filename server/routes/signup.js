const _ = require('lodash');
const express = require('express');
const router = express.Router();
const sha1 = require('sha1');
const fs = require('fs');
const path = require('path');
const Joi  = require('joi');
const utils = require('../lib/utils');
const auth = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const User = require('../db/user');



// GET /signup 注册页
router.get('/', auth.checkNotLogin, function (req, res, next) {
  res.render('signup');
});

// POST /signup 用户注册
router.post('/', auth.checkNotLogin, function (req, res, next) {
  let params = {
    allowMimetypes: ['image/jpeg', 'image/png', 'image/gif'],
    limits: {
      fileSize: 1024 * 1024 * 3,
      fields: 5,
      files: 1
    }
  };

  upload.uploadfile(req, res, params, function (err, file) {
    if (err) {
      req.flash('error', err);
      return res.redirect('/signup');
    }
    // 头像
    req.body.avatar = req.file.relativePath;

    // 校验参数
    let schema = Joi.object().keys({
      name: Joi.string().trim().min(1).max(10).required(),
      bio: Joi.string().min(1).max(30).required(),
      gender: Joi.string().valid(['m', 'f', 'x']).required(),
      password: Joi.string().trim().min(6).required(),
      avatar: Joi.string().required(),
      repassword: Joi.string().trim().min(6).required()
    }).required();

    let validateResult = Joi.validate(req.body, schema);
    if (validateResult.error) {
      // 注册失败，异步删除上传的头像
      utils.rmFileOrDir(req.file.path);
      // 错误消息
      let errmsg = '表单参数错误：' + utils.getValidateErrmsg(validateResult.error.details);
      req.flash('error', errmsg);
      return res.redirect('/signup');
    }

    // 去除空格
    req.body.name = _.trim(req.body.name);
    req.body.password = _.trim(req.body.password);

    // 明文密码加密
    req.body.password = sha1(req.body.password);

    // 用户信息写入数据库
    User.add(req.body, function (err, doc) {
      if (err) {
        utils.rmFileOrDir(req.file.path);
        // 跳转回注册页面
        let errmsg = err.code == 11000 ? '用户名重复' : '注册失败';
        req.flash('error', errmsg);
        return res.redirect('/signup');
      }

      // 注册成功，保存用户信息并跳转到首页
      req.logIn(doc, function(err) {
        if (err) { return next(err); }

        req.flash('success', '注册成功');
        res.redirect('/posts');
      });
    })

  });
});

module.exports = router;
