const appConfig = require('./config');

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const flash = require('connect-flash');

const pkg = require('./package');
const routes = require('./routes');
const db = require('./db');

const app = express();

// 连接数据库
db.connect(appConfig.db);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// session 中间件
app.use(session({
  name: appConfig.session.key, // 设置 cookie 中保存 session id 的字段名称
  secret: appConfig.session.secret, // 通过设置 secret 来计算 hash 值并放在 cookie 中，使产生的 signedCookie 防篡改
  resave: true, // 强制更新 session
  saveUninitialized: false, // 设置为 false，强制创建一个 session，即使用户未登录
  cookie: {
    maxAge: appConfig.session.maxAge// 过期时间，过期后 cookie 中的 session id 自动删除
  },
  store: new MongoStore({ // 将 session 存储到 mongodb
    url: `mongodb://${appConfig.db.host}:${appConfig.db.port}/${appConfig.session.name}` // mongodb 地址
  })
}));

// flash 中间件，用来显示通知
app.use(flash());

// 设置模板全局常量
app.locals.blog = {
  title: pkg.name,
  description: pkg.description
};

// 添加模板必需的三个变量
app.use(function (req, res, next) {
  res.locals.user = req.session.user;
  res.locals.success = req.flash('success').toString();
  res.locals.error = req.flash('error').toString();
  next();
});

// 路由
routes(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  console.log('到错误处理了', err);
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  console.log('执行到这里来来？？？？？');
  return res.render('error');
});

// // 监听端口，启动程序
// app.listen(appConfig.port, function () {
//   console.log(`${pkg.name} listening on port ${appConfig.port}`)
// })

module.exports = app;
