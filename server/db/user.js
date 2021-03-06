const mongoose = require('mongoose');
const userModel = mongoose.model('user');
const _ = require('lodash');

module.exports = {
  add: function (params, cb) {
    let obj = _.pick(params, 'name', 'password', 'avatar', 'gender', 'bio');

    userModel.create(obj, function (err, doc) {
      if (err) {
        return cb(err);
      }
      return cb(null, doc);
    })
  },
  getUserByName: function (name, cb) {
    userModel.findOne({name: name}).lean().exec(function (err, doc) {
      return cb(err, doc);
    })
  },
  remove: function (query, cb) {
    userModel.remove(query, function (err, result) {
      return cb(err, result);
    })
  },
  findById: function (id, cb) {
    userModel.findById(id, function (err, result) {
      return cb(err, result);
    })
  },
  findByName: function (name, cb) {
    userModel.findOne({name: name}, function (err, result) {
      return cb(err, result);
    })
  }
};
