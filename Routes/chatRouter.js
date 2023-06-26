const express = require("express");
const  io  = require('../Socket').get();
const route = express.Router();
const users = require("../Models/client");
const boatOwner = require("../Models/boatOwner");
const trips = require("../Models/trip");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const chatSchema = require("../Models/chat");

route.use(cors())



// Get all messages



module.exports = route;