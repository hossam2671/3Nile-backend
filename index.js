// Call The Connection File 
require("./config/connection");

// Call Packages 
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
//  Call Modules -- >> Schemas
const Admin = require("./Models/admin");
const boatOwner = require("./Models/boatOwner");
const user = require("./Models/client");
const boat = require("./Models/boat");
const trip = require("./Models/trip");
const review = require("./Models/review");
// Call Routes : 

const userRoute=require('./Routes/userRoute')
const boatOwnerRoute=require('./Routes/boatOwnerRouter')
const adminRoute=require('./Routes/adminRouter')



// calling express and use it to use middlewares
const app = express();
app.use(cors());
app.use(express.static('uploads'))

const server = require('http').createServer(app)

// Socket 
const SocketIO = require('socket.io')
const io =SocketIO(server)

io.on('connection',(socket)=>{
    console.log("new User Connected");
  
  })

// calling middlewares : 
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.get('/',function(req,res)
{
    res.send("welcome 3-Nile Team")
})
app.use('/user',userRoute)
app.use('/boatOwner',boatOwnerRoute)
app.use('/admin',adminRoute)

// port listening

server.listen(5000,function()
{
    console.log("listen");
})
// 

app.post("/login", async (req, res) => {
  try {
    const boatOwnerData = await boatOwner.findOne({ email: req.body.email });
    if (!boatOwnerData) {
    
      try {
        const userData = await user.findOne({ email: req.body.email });
        if (!userData) {
          res.status(401).json({ error: "Invalid credentials" });
        } else {
          const isValidPassword = await bcrypt.compare(
            req.body.password,
            userData.password
          );
          if (isValidPassword) {
            const token = jwt.sign({ user: userData._id }, "3-nile");
            // Set The Id In Cookie With Encryption
            res.cookie("userId", token, { maxAge: 900000, httpOnly: true });
            let user = 'user'
            res.send({userData,user});
          } else {
            res.send("Invalid Password");
          } 
        }
      } catch (err) {
        res.status(401).json({ error: err.message });
      }
 
    } else {
      const isValidPassword = await bcrypt.compare(
        req.body.password,
        boatOwnerData.password
      );
      if (isValidPassword) {
        const token = jwt.sign({ boatOwner: boatOwnerData._id }, "3-nile");
        //   console.log(boatOwnerData._id)
        // Set The Id In Cookie With Encryption
        res.cookie("boatOwnerId", token, { maxAge: 9000000, httpOnly: true });
        let boatOwner = 'boatOwner'
        res.send({boatOwnerData,boatOwner});
      } else {
        res.send("Invalid Password");
      }
    }
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});


// 

app.post("/register", async function (req, res) {
    let ownerData = await boatOwner.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      // 'img':req.body.img
    });
    io.emit('boat-owner-registered', ownerData);

    res.send("data registered");
  });
