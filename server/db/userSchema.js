mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    enum: ['m', 'f', 'x'],
    default: 'x'
  },
  bio: {
    type: String,
    required: true
  }
}, {
  timestamps: { createdAt: 'createAt', updatedAt: 'updateAt' } // 自动管理创建和修改时间
});

userSchema.index({name: 1}, {unique: true});

mongoose.model('user', userSchema);
