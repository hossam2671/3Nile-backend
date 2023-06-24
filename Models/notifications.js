const mongoose = require("mongoose");
const notificationsSchema = mongoose.Schema({
 
  message: {
    type: String,
    require: true,

  },
  status: {
    type: String,
    default: "unRead"
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "clients",
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
},
{
  versionKey:false,
   strict:false,
});
const Notification = mongoose.model("notifications", notificationsSchema);
module.exports = Notification;
