const mongoose = require('mongoose');

require('./userSchema');
require('./articleSchema');

module.exports.connect = function (dbConfig) {
  let user = '';
  if (dbConfig.user && dbConfig.password) {
    user = `${dbConfig.user}:${dbConfig.password}@`;
  }

  let uri = `mongodb://${user}${dbConfig.host}:${dbConfig.port || 27017}/${dbConfig.name}`;
  mongoose.connect(uri, {server: {auto_reconnect: true}});

  let db = mongoose.connection;
  db.on('error', function (error) {
    console.log('-------连接数据库失败----------', error);
  });

  db.on('close', function () {
    mongoose.connect(uri, {server: {auto_reconnect: true}});
  });

  db.once('open', function () {
    console.log('---------连接数据库成功---------')
  });
};
