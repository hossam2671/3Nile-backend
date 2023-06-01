const mongoose = require("mongoose");
const adminSchema = mongoose.Schema({
  name: {
    type: "string",
    min: 3,
    max: 25,
    require: true,
  },

  email: {
    type: "string",
    require: true,
    unique: true,
  },

  img: {
    type: "string",
  },

  passwod: {
    type: "string",
    require: true,
    min: 8,
    max: 30,
  },
},
{
  versionKey:false,
   strict:false,
});
const Admin = mongoose.model("admins", adminSchema);
module.exports = Admin;
