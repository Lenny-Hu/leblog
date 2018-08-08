const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const sha1 = require('sha1');
const User = require('../db/user');

// 权限检查
module.exports = {
  checkLogin: function (req, res, next) {
    if (!req.user) {
      req.flash('error', '未登录');
      return res.redirect('/signin');
    }
    next();
  },
  checkNotLogin: function (req, res, next) {
    if (req.user) {
      req.flash('error', '已登录');
      return res.redirect('back'); // 返回之前的页面
    }
    next();
  },
  // 本地登录认证 - 未使用
  localStrategy: new LocalStrategy(
    function(username, password, done) {
      User.findByName(username, function (err, user) {
        if (err) { return done(err); }
        if (!user) {
          return done(null, false, { message: '没有该用户' });
        }
        // 检查用户名和密码
        if (sha1(password) !== user.password) {
          return done(null, false, { message: '用户名或密码错误' });
        }
        return done(null, user);
      });
    }
  ),
  // passport相关
  serializeUser: function(user, done) {
    console.log('serializeUser', user);
    done(null, user.id);
  },
  // passport相关
  deserializeUser: function(id, done) {
    User.findById(id, function(err, user) {
      console.log('获取用户', err, user);
      done(err, user);
    });
  }
};