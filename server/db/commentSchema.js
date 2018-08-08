const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  article: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'article',
    required: true
  },
  content: {
    type: String,
    required: true
  }
}, {
  timestamps: {createdAt: 'createAt', updatedAt: 'updateAt'} // 自动管理创建时间和更新时间
});

commentSchema.index({article: 1, createAt: -1});

mongoose.model('comment', commentSchema);
