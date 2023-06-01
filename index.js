// Call The Connection File 
require("./config/connection");

// Call Packages 
const express = require("express");
const cors = require("cors");

//  Call Modules -- >> Schemas
const Admin = require("./Models/admin");
const boatOwner = require("./Models/boatOwner");
const client = require("./Models/client");
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
