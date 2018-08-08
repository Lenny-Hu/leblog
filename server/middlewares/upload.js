// 文件上传公共库
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const log = require('../log');

// 检查上传的文件夹
const uploadDir = path.join(__dirname, '../public/uploads');
fs.stat(uploadDir, function (err, stat) {
  if (err) {
    fs.mkdir(uploadDir, function (err) {
      if (err) {
        console.log(`创建上传目录失败：${err}`);
      }
    })
  }
});

// 定制存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 上传文件最终的存放目录
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // 修改下文件名称，防止重名覆盖
    let result = path.parse(_.trim(file.originalname));
    let newfilename = `${result.name}-${Date.now()}${result.ext}`;
    cb(null, newfilename);
  }
});

module.exports = {
  uploadfile: function (req, res, params, cb) {
    if (!_.isObject(params)) {
      return cb('params为必传对象');
    }

    if (!params.limits) {
      params.limits = {
        fileSize: 1024 * 1024 * 5, // 默认最大5MB
        fields: 1, // 默认最多1个文本字段
        files: 1 // 默认最多一个文件
      }
    }

    let options = {storage: storage, limits: params.limits};

    // 文件类型过滤
    if (_.isArray(params.allowMimetypes) && params.allowMimetypes.length > 1) {
      options.fileFilter = function (req, file, cb) {
        let isAllow = false;
        for (let i = 0; i < params.allowMimetypes.length; i++) {
          if (file.mimetype == params.allowMimetypes[i]) {
            isAllow = true;
            break;
          }
        }
        if (isAllow) {
          return cb(null, true);
        } else {
          return cb('不允许上传此类文件', false);
        }
      }
    }

    const upload = multer(options).single('file');

    upload(req, res, function (err) {
      if (err) {
        return cb(err);
      }
      if (!req.file) {
        return cb('没有选择文件');
      }

      req.file.relativePath = `/uploads/${req.file.filename}`;
      log.info('上传文件：' + JSON.stringify(req.file));
      return cb(null, req.file);
    });
  }
};

