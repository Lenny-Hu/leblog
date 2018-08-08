const _ = require('lodash');
const express = require('express');
const router = express.Router();
const sha1 = require('sha1');
const fs = require('fs');
const path = require('path');
const Joi  = require('Joi');
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
    console.log('收到的参数1111111', req.body, req.fields);
    console.log('上传的文件', err, file);

    // 明文密码加密
    req.body.password = sha1(req.body.password);
    // 头像
    req.body.avatar = req.file.relativePath;

    // 校验参数
    let schema = Joi.object().keys({
      name: Joi.string().min(1).max(10).required(),
      boi: Joi.string().min(1).max(30).required(),
      gender: Joi.string().valid(['m', 'f', 'x']).required(),
      password: Joi.string().min(6).required(),
      avatar: Joi.string().required()
    }).or('name', 'boi', 'gender', 'password', 'avatar');

    let validateResult = Joi.validate(req.body, schema);
    if (validateResult.error) {
      console.log(validateResult.error);
      // 注册失败，异步删除上传的头像
      utils.rmFileOrDir(req.file.path);
      // 错误消息
      let errmsg = '表单参数错误：';
      _.forEach(validateResult.error.details, function (v) {
        errmsg += '\n' + v.message;
      });
      req.flash('error', errmsg);
      return res.redirect('/signup');
    }

    // 用户信息写入数据库
    User.add(req.body, function (err, doc) {
      console.log(4444, err, doc);
      if (err) {
        utils.rmFileOrDir(req.file.path);
        // 跳转回注册页面
        let errmsg = err.code == 11000 ? '用户名重复' : '注册失败';
        req.flash('error', errmsg);
        return res.redirect('/signup');
      }

      // 注册成功，保存用户信息并跳转到首页
      // 删除密码这种敏感信息，将用户信息存入 session
      delete doc.password;
      req.session.user = doc;
      req.flash('success', '注册成功');
      res.redirect('/posts');
    })

  });
});

module.exports = router;