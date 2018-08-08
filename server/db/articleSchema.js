const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  pv: {
    type: Number,
    default: 0
  }
}, {
  timestamps: { createdAt: 'createAt', updatedAt: 'updateAt' } // 自动管理创建和修改时间
});

articleSchema.index({createAt: -1, creator: 1});
articleSchema.index({createAt: -1, title: 1});

mongoose.model('article', articleSchema);
