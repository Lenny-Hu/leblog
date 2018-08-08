const mongoose = require('mongoose');
const _ = require('lodash');
const commentModel = mongoose.model('comment');

const setQuery = function (params) {
  query = {};
  if (_.isObject(params)) {
    if (params.creator) {
      query.creator = params.creator;
    }
    if (params.article) {
      query.article = params.article;
    }
  }
  return query;
};

module.exports = {
  add: function (params, cb) {
    let obj = _.pick(params, 'article', 'content', 'creator');

    commentModel.create(obj, function (err, doc) {
      if (err) {
        return cb(err);
      }
      return cb(null, doc);
    })
  },
  findById: function (id, cb) {
    commentModel.findById(id).populate('creator').populate('article', '_id title').lean().exec(function (err, doc) {
      if (err || !doc) {
        return cb(err ? err : '没有找到这个留言');
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
    commentModel.find(query, null, options).populate('creator').populate('article', '_id title').lean().exec(function (err, results) {
      if (err) {
        return cb(err);
      }
      return cb(null, results);
    })
  },
  count: function (params, cb) {
    let query = setQuery(params);
    commentModel.count(query, function (err, count) {
      if (err) {
        return cb(err);
      }
      return cb(null, count);
    })
  },
  findOneAndRemove: function (user, id, cb) {
    commentModel.findOneAndRemove({_id: id, creator: user._id}, {select: {article: 1, _id: 1}}, function (err, result) {
      if (err) {
        return cb(err);
      }
      return cb(null, result);
    })
  },
  removeByArticleId: function (id, cb) {
    commentModel.remove({article: id}, function (err, result) {
      if (err) {
        return cb(err);
      }
      return cb(null, result);
    })
  }
};