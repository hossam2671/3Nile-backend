const express = require("express");
const route = express.Router();
const user = require("../Models/client");
const boats = require("../Models/boat");
const trips = require("../Models/trip");
const reviews = require("../Models/review");
const cookieParser = require("cookie-parser");
const cors = require("cors")
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const path = require("path");
const multer = require("multer");
route.use(express.static(path.join(__dirname, "./uploads")));
route.use(express.static("./uploads"));
route.use(cors())
route.use(cookieParser());

// multter img 
const fileStorage = multer.diskStorage({
  destination: (req, file, callbackfun) => {
    callbackfun(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname.replaceAll(" ", ""));
  },
});
const upload = multer({ storage: fileStorage });
route.use(cookieParser());
// Register :
route.post("/userRegister", async function (req, res) {
  console.log(req.body);
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  req.body.password = hashedPassword;
  let userData = await user.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    // 'img':req.body.img
  });
  res.send("data registered");
});

// Log In :
route.post("/userLogin", async (req, res) => {
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
        res.send(userData);
      } else {
        res.send("Invalid Password");
      } 
    }
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

// edit user info 
route.get("/editUserinfo", async function (req, res) {
  let editUserinfo = await user.findById(req.body.id);
  res.send(editUserinfo);
});
route.put("/editUserinfo", 
upload.single("image"),
async function (req, res) {
  let editUserinfo = await user.findByIdAndUpdate(req.body.id,{
    name: req.body.name,
    img: req.file.path,
  });
  res.send("done");
});

//get all boats
route.get("/boats", async (req, res) => {
  const allBoats = await boats.find();
  res.send(allBoats);
});

//get all boats in category 1

route.get("/category/3nile/boats", async (req, res) => {
  const firCatBoats = await boats.find({ category: "3nile" });
  // console.log(firCatBoats);
  res.send(firCatBoats);
});

//get all boats in category 2
route.get("/category/3nileplus/boats", async (req, res) => {
  const secCatBoats = await boats.find({ category: "3nileplus" });
  res.send(secCatBoats);
});

//get all boats in category 3
route.get("/category/3nilevip/boats", async (req, res) => {
  const thiCatBoats = await boats.find({ category: "3nile vip" });
  res.send(thiCatBoats);
});

// Get One Boat : description Page
route.get('/boat', async (req, res) => {
  const boatData = await boats.findById(req.body.id)
  res.send(boatData); 
 })

// aDD tRIP
 route.post('/addTrip',async(req, res) => {
  // res.send(req.cookies)
   let id = jwt.verify(req.cookies.userId, "3-nile");
   const boatData =  await boats.findById(req.body.id)
   const tripData = await trips.create({
     boatId: req.body.id,
     price:boatData.price*req.body.hours,
     hours:req.body.hours,
     startTime:req.body.startTime,
     date:req.body.date,
     clienId:id,
     status:"pending"
   })
   res.send(boatData)
 })

 // cancel trip
route.put('/cancelTrip',async(req, res) =>{
const tripData = await trips.findByIdAndUpdate(req.body.id,{
 status:"cancelled"
})
res.send("cancelled")
})

// fininsh trip
route.put('/finishTrip',async(req, res) =>{
const tripData = await trips.findByIdAndUpdate(req.body.id,{
 status:"finished"
})
res.send("finished")
})


// get all user trips

route.get('/userTrips', async (req, res) => {
let id = jwt.verify(req.cookies.userId, "3-nile");
const userTrips = await trips.find({clienId:id})
res.send(userTrips)
})
// get all user finished trips

route.get('/userTrips/finished', async (req, res) => {
let id = jwt.verify(req.cookies.userId, "3-nile");
const userTrips = await trips.find({clienId:id , status:"finished"})
res.send(userTrips)
})
// get all user pending trips

route.get('/userTrips/pending', async (req, res) => {
let id = jwt.verify(req.cookies.userId, "3-nile");
const userTrips = await trips.find({clienId:id , status:"pending"})
res.send(userTrips)
})

// get all user accepted trips
route.get('/userTrips/accepted', async (req, res) => {
let id = jwt.verify(req.cookies.userId, "3-nile");
const userTrips = await trips.find({clienId:id , status:"accepted"})
res.send(userTrips)
})



// Create a new review
route.post("/addReview", async (req, res) => {
  try {
    const findTrip= await reviews.find({tripId: req.body.tripId});
    // if(findTrip){

    // }else
    // {
    const review = await reviews.create({
      boatId: req.body.boatId,
      clientId: req.body.clientId,
      tripId: req.body.tripId,
      rating: req.body.rating,
      comment: req.body.comment,
    });
    res.status(201).send(review);


  } catch (error) {
    res.status(400).send(error);
  }
});
// Top-rated Boats
route.get("/boats/top-rated", async (req, res) => {
  try {
    const topRatedBoats = await boats.aggregate([
      {
        // Join with the Review collection to get the average rating
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "boatId",
          as: "reviews",
        },
      },
      {
        // Calculate the average rating
        $addFields: {
          averageRating: { $avg: "$reviews.rating" },
        },
      },
      {
        // Sort by average rating in descending order
        $sort: {
          averageRating: -1,
        },
      },
      {
        // Limit to the top 10 boats
        $limit: 2,
      },
    ]);
    res.send(topRatedBoats);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = route;