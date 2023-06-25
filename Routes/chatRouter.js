const express = require("express");
const  io  = require('../Socket').get();
const route = express.Router();
const users = require("../Models/client");
const boatOwner = require("../Models/boatOwner");
const boats = require("../Models/boat");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const Swvl = require("../Models/swvl");
const uuid = require('uuid');
const ShortUniqueId = require('short-unique-id');
const chatSchema = require("../Models/chat");
const uid = new ShortUniqueId({ length: 4 });

route.use(cors())


route.post('/chat', async (req, res) => {
  const chatRoomId = req.body.chatRoomId;
  const sender = req.body.sender;
  const message = req.body.message;

  const chat = new chatSchema({ chatRoomId, sender, message });

  await chat.save();

  io.to(chatRoomId).emit('message', { chatRoomId, sender, message });

  res.send({ chat });
});


module.exports = route;