const mongoose = require('mongoose');

const userComments = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'users'
      },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
    versionKey: false,
    strict: false,
  });
  
const Comments = mongoose.model('comments', userComments);

module.exports = Comments;