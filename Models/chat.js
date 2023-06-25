const mongoose = require("mongoose");
const ChatSchema = mongoose.Schema(
  {
 
        tripId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'trips',
          // required: true
        },
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'clients',
          // required: true
        },
        message: {
          type: String,
          // required: true
        },
        createdAt: {
          type: Date,
          default: Date.now
        },
    },

  {
    versionKey: false,
    strict: false,
  }
);
const chatSchema = mongoose.model("chats", ChatSchema);
module.exports = chatSchema;
