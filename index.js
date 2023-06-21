// Call The Connection File 
require("./config/connection");
const express = require("express");
const app = express();
const server = require('http').createServer(app)
const io = require('./Socket').init(server);
// Call Packages 

const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
//  Call Modules -- >> Schemas
const Admin = require("./Models/admin");
const boatOwner = require("./Models/boatOwner");
const user = require("./Models/client");
const boats = require("./Models/boat");
const trips = require("./Models/trip");
const review = require("./Models/review");
// Call Routes : 

const userRoute=require('./Routes/userRoute')
const boatOwnerRoute=require('./Routes/boatOwnerRouter')
const adminRoute=require('./Routes/adminRouter');
const swvlRoute=require('./Routes/swvlRoute');



// calling express and use it to use middlewares

app.use(express.static('uploads'))


app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(cors());



// Socket 
// const SocketIO = require('socket.io')
//  const io =SocketIO(server,{
//   cors: {
//     methods: ['GET', 'POST'],
//     allowedHeaders: ['my-custom-header'],
//     credentials: true,
//   }
// })




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
app.use('/swvl',swvlRoute)

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
          console.log("No Account Found, Try Again")
          res.json({
            message: "No Account Found, Try Again",
            status: 401,
            data: req.body,
            success: false,
          }); 
        } else {

          const isValidPassword = await bcrypt.compare(
            req.body.password,
            userData.password
          );
          if (isValidPassword) {

            if(userData.status!=="blocked"){
              const token = jwt.sign({ user: userData._id }, "3-nile");
              // Set The Id In Cookie With Encryption
              res.cookie("userId", token, { maxAge: 900000, httpOnly: true });
              let user = 'user'
              res.send({userData,user});
            }
            else{
              res.json({
                message: "Sorry , You Were Blocked ",
                status: 401,
                data: req.body,
                success: false,
              }); 
            }
           
          } else {
            console.log("invalid credentials , password incorrect")
            res.json({
              message: "invalid credentials , password incorrect",
              status: 401,
              data: req.body,
              success: false,
            }); 
          } 
        }
      } catch (err) {
        console.log("password incorrect")
        res.json({
          message: "invalid credentials , password incorrect",
          status: 401,
          data: req.body,
          success: false,
        }); 
      }
 
    } else {
      const isValidPassword = await bcrypt.compare(
        req.body.password,
        boatOwnerData.password
      );
      if (isValidPassword) {
        io.emit('boat-owner-Logged', boatOwnerData);

        const token = jwt.sign({ boatOwner: boatOwnerData._id }, "3-nile");
        //   console.log(boatOwnerData._id)
        // Set The Id In Cookie With Encryption
        res.cookie("boatOwnerId", token, { maxAge: 9000000, httpOnly: true });
        let boatOwner = 'boatOwner'
        if(boatOwnerData.status==='pending'){
          console.log("Welcome Back,Please Wait Until Admin Accept You ,Try Login Again Later")
          res.json({
            message: "Welcome Back,Please Wait Until Admin Accept You ,Try Login Again Later",
            status: 401,
            data: req.body,
            success: false,
          })
        }else{

          res.send({boatOwnerData,boatOwner});
        }
      } else {
        console.log("Invalid Password, Try Again")
        res.json({
          message: "Invalid Password, Try Again",
          status: 401,
          data: req.body,
          success: false,
        }); 
      }
    }
  } catch (err) {
    res.json({
      message: "Invalid Values , Try Again",
      status: 401,
      data: req.body,
      success: false,
    }); 
  }
});

app.post('/addTrip', async (req, res) => {
  // res.send(req.cookies)
  // let id = jwt.verify(req.cookies.userId, "3-nile");
  const boatData = await boats.findById(req.body.boatId)
  const tripData = await trips.create({
    boatId: req.body.boatId,
     price:boatData.price*req.body.hours,
    hours: req.body.hours,
     startTime:req.body.startTime,
     date:req.body.date,
    clienId: req.body.clienId,
    status: "pending"
  })
  io.emit('You-Has-A-New-Trip', tripData);


  res.send(boatData)
})

// 

app.post("/register", async function (req, res) {
    let ownerData = await boatOwner.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      // 'img':req.body.img
    });
    io.emit('boat-owner-registered', ownerData);
      console.log("REeeegisteds")
    res.send("data registered");
  });


function add()
{
  console.log("object");
}
module.exports=add;