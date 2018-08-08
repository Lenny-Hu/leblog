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
  }
}