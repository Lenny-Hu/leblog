const mongoose = require('mongoose');
const _ = require('lodash');
const articleModel = mongoose.model('article');

const setQuery = function (params) {
  query = {};
  if (_.isObject(params)) {
    if (params.creator) {
      query.creator = params.creator;
    }
  }
  return query;
};

module.exports = {
  add: function (params, cb) {
    let obj = _.pick(params, 'title', 'content', 'creator', 'pv');

    articleModel.create(obj, function (err, doc) {
      if (err) {
        return cb(err);
      }
      return cb(null, doc);
    })
  },
  findById: function (id, cb) {
    articleModel.findById(id).populate('creator').lean().exec(function (err, doc) {
      if (err || !doc) {
        return cb(err ? err : '没有找到这篇文章');
      }
      return cb(null, doc);
    })
  },
  find: function (params, cb) {
    let query = setQuery(params);
    let options = {
      sort: {createAt: -1},
      limit: Math.min(params.limit || 20, 100),
      skip: params.skip || 0,
    };
    articleModel.find(query, null, options).populate('creator').lean().exec(function (err, results) {
      if (err) {
        return cb(err);
      }
      return cb(null, results);
    })
  },
  count: function (params, cb) {
    let query = setQuery(params);
    articleModel.count(query, function (err, count) {
      if (err) {
        return cb(err);
      }
      return cb(null, count);
    })
  },
  // 更新浏览数
  incPv: function (id, cb) {
    articleModel.update({_id: id}, {$inc: {pv: 1}}, function (err, result) {
      if (err) {
        return cb(err);
      }
      return cb(null, result);
    })
  },
  // 更新评论数
  incCommentCount: function (id, number, cb) {
    articleModel.update({_id: id}, {$inc: {commentsCount: number}}, function (err, result) {
      if (err) {
        return cb(err);
      }
      return cb(null, result);
    })
  },
  update: function (user, id, params, cb) {
    let update = _.pick(params, 'title', 'content');
    articleModel.update({_id: id, creator: user._id}, {$set: update}, function (err, result) {
      if (err) {
        return cb(err);
      }
      return cb(null, result);
    })
  },
  // 删除当前登录用户的文章
  remove: function (user, id, cb) {
    articleModel.remove({_id: id, creator: user._id}, function (err, result) {
      if (err) {
        return cb(err);
      }
      return cb(null, result);
    })
  }
};