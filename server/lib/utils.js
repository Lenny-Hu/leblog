const fse = require('fs-extra');
const _ = require('lodash');

module.exports = {
  rmFileOrDir: function (path, cb) {
    let hasCb = _.isFunction(cb);

    fse.remove(path, function (err) {
      if (err) {
        console.log(`删除文件或目录失败：${err}`);
        if (hasCb) {
          return cb(err);
        }
        return false;
      }
      if (hasCb) {
        return cb(null);
      }
    })
  }
};
