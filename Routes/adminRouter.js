const express = require("express");
const route = express.Router();
const admin = require("../Models/admin");
const users = require("../Models/client");
const boats = require("../Models/boat");
const trips = require("../Models/trip");
const boatOwner = require("../Models/boatOwner");
const offers = require('../Models/Offer')
const reviews = require('../Models/review')
const admins = require('../Models/admin')
const cors = require("cors")
const cookieParser = require("cookie-parser");
const { ObjectId } = require('mongoose').Types;

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const moment = require('moment');
const path = require("path");
const multer = require("multer");
const comments = require("../Models/userComments");
route.use(express.static(path.join(__dirname, "./uploads")));
route.use(express.static("./uploads"));

route.use(cors())

const fileStorage = multer.diskStorage({
  destination: (req, file, callbackfun) => {
    callbackfun(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname.replaceAll(" ", ""));
  },
});
const upload = multer({ storage: fileStorage });
// Register :
route.post("/register", upload.single("image"), async function (req, res) {
  console.log(req.body);
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  req.body.password = hashedPassword;
  let adminData = await admin.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    img:req.body.img
    // img: req.file.filename,
  });
 
  res.send("data registered");
});
// Log In :
route.post("/login", async (req, res) => {
    try {
      const adminData = await admin.findOne({ email: req.body.email });
      if (!adminData) {
        res.status(401).json({ error: "Invalid credentials" });
      } else {
        const isValidPassword = await bcrypt.compare(
          req.body.password,
          adminData.password
          )
          if (isValidPassword) {
              const token = jwt.sign({ admin: adminData._id }, "3-nile");
              // Set The Id In Cookie With Encryption
              res.cookie("adminId", token, { maxAge: 900000, httpOnly: true });
              res.send(adminData)
              
            }else{
                res.send("Invalid Password")
            }
      }
    } catch (err) {
      res.status(401).json({ error: err.message });
    }
  });

//   Get Admin Data  : 
route.get('/getData/:email', async function(req,res){
  let adminData = await admin.findOne({email:req.params.email})
  console.log(adminData);
  res.json(adminData)
})

route.put("/editAdminData/:email",
  upload.single("img"),
  async function (req, res) {
    console.log(req.file)
      let adminData = await admins.find({email:req.params.email})
      console.log(adminData)
    let editUserinfo = await admins.findByIdAndUpdate("adminData._id", {
      img: req.file.filename,
  
    }).then((res)=>{
      console.log(res,"dsada");
    })
    let admin = await admins.find({email:req.params.email})
    res.send(admin);
  });
// get All Users 
route.get('/getAllUsers',async function(req,res){
    let allUsers = await users.find({})
    res.send(allUsers)
})
// get All boatOwner
route.get('/getAllBoatOwners',async function(req,res){
    let allBoatOWners = await boatOwner.find({})
    res.send(allBoatOWners)
})
// get All boats
route.get('/getAllBoats',async function(req,res){
    let allBoats = await boats.find({})
    res.send(allBoats)
})
route.get('/getTrip/:id', async (req, res) => {
  try {
    const trip = await trips.findById(req.params.id);
    const boat = await boats.findById(trip.boatId);
    const user = await users.findById(trip.clientId);
    res.status(200).send({trip,user,boat});
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});
route.get('/getAllBoatss', async function(req, res) {
  try {
    const allBoats = await boats.find({}).populate('reviews');
    console.log(allBoats)
    res.send(allBoats.rating);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});


// get All trips
route.get('/getAllTrips',async function(req,res){
    let allTrips = await trips.find({})
    res.send(allTrips)
})

//  get user by id ->
// then update his status from active or block
route.put('/getUser/:id/status', async (req, res) => {
  try {
    
   // const user = await users.findByIdAndUpdate(req.params.id, {status: req.body.status});
   const user = await users.findById(req.params.id)
   if(user.status == "active"){
    const user2 = await users.findByIdAndUpdate(req.params.id, {status: "blocked"});
  }
  else{
    const user2 = await users.findByIdAndUpdate(req.params.id, {status: "active"});
   }
    res.status(200).send(user);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

//  get boatOwner by id ->
//  then update his status from pending or active
route.put('/getBoatOwner/:id/status', async (req, res) => {
  try {
    const owner = await boatOwner.findById(req.params.id)
    if(owner.status=='pending'){
      const BoatOwner = await boatOwner.findByIdAndUpdate(req.params.id, {status: 'accepted'});

    }
    res.status(200).send(owner);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});
// owner boats 
route.get('/getBoatOwnerBoats/:id', async (req, res) => {
  let boatOwnerData = await boatOwner.findById(req.params.id);
  let data = [];
  for (let i = 0; i < boatOwnerData.boat.length; i++) {
    data.push(await boats.findById(boatOwnerData.boat[i]));
  }
  res.send(data);
});
//  get boat by id ->
// then update it status from active or block
route.put('/getBoat/:id/status', async (req, res) => {
  try {
    
    // const user = await users.findByIdAndUpdate(req.params.id, {status: req.body.status});
    const boat = await boats.findById(req.params.id)
    if(boat.status == "active"){
     const boat = await boats.findByIdAndUpdate(req.params.id, {status: "blocked"});
   }
   else{
     const boat = await boats.findByIdAndUpdate(req.params.id, {status: "active"});
    }
     res.status(200).send(boat);
   } catch (err) {
     console.error(err);
     res.status(500).send('Server Error');
   }
});
// Get User By Id ,
route.get('/getUserData/:id', async (req, res) => {
  try {
    const userData = await users.findById(req.params.id);
    res.status(200).send(userData);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});
  // get user trips by id ,
  route.get('/userTrips/:id', async (req, res) => {

    const user = await users.find({clienId:req.params.id})
    const userTrips = await trips.find({clienId:user._id}).populate("boatId")
    console.log(userTrips,"sdsdas");
    res.send(userTrips);
    })
  route.get('/getBoatTrips/:id', async (req, res) => {
    const boat = await boats.findById(req.params.id)

    const BoatTrips = await trips.find({boatId:boat._id})
    console.log(BoatTrips,"BoatTrips");
    res.send(BoatTrips);
    })
// Get Boat By Id ,
route.get('/getBoatData/:id', async (req, res) => {
  try {
    const boatData = await boats.findById(req.params.id);
    res.status(200).send(boatData);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});
// Get Owner By ID , 
route.get('/getBoatOwnerData/:id', async (req, res) => {
  try {
    const boatOwnerData = await boatOwner.findById(req.params.id);
    res.status(200).send(boatOwnerData);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});
// ****************************************************

// Add an offer
route.post('/AddOffer', async (req, res) => {
  console.log(req.body.name);
  try {
      const offer = await offers.create({
        name: req.body.name,
        description: req.body.description,
        discount_percentage: req.body.discount_percentage,
        // start_date: req.body.start_date,
        end_date: req.body.end_date,
        // boat id 
      })
      
      res.status(201).send(offer);
  } catch (error) {
      res.status(400).send(error);
  }
});

//Get all offers
route.get('/getAllOffers', async (req, res) => {
  try {
      const offersData = await offers.find();
      res.send(offersData);
  } catch (error) {
      res.status(500).send(error);
  }
});
// GEt Offer By ID :

// Get a single offer
route.get('/getOfferData/:id', async (req, res) => {
  try {
      const offer = await offers.findById(req.params.id);
      if (!offer) {
          return res.status(404).send();
      }
      res.send(offer);
  } catch (error) {
      res.status(500).send(error);
  }
});


// Delete an offer
route.delete('/deleteOffer/:id', async (req, res) => {
  try {
      const offer = await offers.findByIdAndDelete(req.params.id);
      if (!offer) {
          return res.status(404).send();
      }
      res.send(offer);
  } catch (error) {
      res.status(500).send();
  }
});



// Cancel Trip Or Accepted
route.put('/getTripAndUpdate/:id/status', async (req, res) => {
  try {
    const trip = await trips.findByIdAndUpdate(req.params.id, {status: req.body.status});
    res.status(200).send(trip);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});


// ****************************************************
// Top Rated Boats :


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
        $limit: 5,
      },
    ]);
    res.send(topRatedBoats);
  } catch (error) {
    res.status(500).send(error);
  }
});



// ****************************************************

// Get the top-rated boat owners
// route.get('/boatowners/top-rated', async (req, res) => {
//   try{

  
//       const owners = await boatOwner.aggregate([
//           {
//               $lookup: {
//                   from: 'boats',
//                   localField: 'boat',
//                   foreignField: '_id',
//                   as: 'ownedBoats'
//               }
//           },
//           {
//               $unwind: '$ownedBoats'
//           },
//           {
//               $lookup: {
//                   from: 'reviews',
//                   localField: 'ownedBoats._id',
//                   foreignField: 'boatId',
//                   as: 'reviews'
//               }
//           },
//           {
              
//                   $group: {
//                     _id: '$_id',
//                     name: { $first: '$name' },
//                     email: { $first: '$email' },
//                     avgRating: { $avg: { $ifNull: ['$reviews.rating', 0] } }
//                     }
//                     },
//                     {
//                     $sort: { avgRating: -1 }
//                     },
//                     {
//                     $limit: 10
//                     }
//                     ])
//                     res.send(owners)
//                   }
//                   catch{
//                     res.send(err)
//                   }
//                   });












// Get site statistics
route.get('/site-stats', async function(req,res){
  let stats = {};
  stats.numUsers = await users.countDocuments();
  stats.numBoats = await boats.countDocuments();
  stats.numTrips = await trips.countDocuments();
  stats.numOwners = await boatOwner.countDocuments();
  console.log(stats);
  res.json(stats);
})

// Get number of registered users
route.get('/num-users', async function(req,res){
  let count = await users.countDocuments();
  res.json(count);
})

// Get number of boats
route.get('/num-boats', async function(req,res){
  let count = await boats.countDocuments();
  res.json(count);
})

// Get number of trips
route.get('/num-trips', async function(req,res){
  let count = await trips.countDocuments();
  res.json(count);
})
// Get number of boatOWners
route.get('/num-owners', async function(req,res){
  let count = await boatOwner.countDocuments();
  console.log(count);
  res.json(count);
})
route.get('/num-admins', async function(req,res){
  let count = await admins.countDocuments();
  console.log(count);
  res.json(count);
})
route.get('/num-offers', async function(req,res){
  let count = await offers.countDocuments();
  console.log(count);
  res.json(count);
})
route.get('/num-comments', async function(req,res){
  let count = await comments.countDocuments();
  console.log("comments",count);
  res.json(count);
})
route.get('/num-reviews', async function(req,res){
  let count = await reviews.countDocuments();
  console.log("reviews",count);
  res.json(count);
})
// get users comments

route.get('/comments', async function(req,res){
  let commentsData = await comments.find({});
  console.log("comments",commentsData);
  res.json(commentsData)
}
)









   











// ****************************************************

// charts by weeek
route.get('/allStats', async (req, res) => {
  const today = new Date();
  console.log(today)
  const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay()); // Get the start date of the current week
  console.log(startOfWeek)
  try {
    const userStats = await users.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfWeek } // Filter users created this week
        }
      },
      {
        $group: {
          _id: {
            week: { $isoWeek: "$createdAt" },
            year: { $year: "$createdAt" }
          },
          count: { $sum: 1 } // Count the number of users in each week
        }
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.week": 1
        }
      }
    ]);

    const tripStats = await trips.aggregate([
      {
        $match:{
          createdAt: { $gte: startOfWeek } // Filter trips that started this week
        }
      },
      {
        $group: {
          _id: {
            week: { $isoWeek: "$createdAt" },
            year: { $year: "$createdAt" }
          },
          count: { $sum: 1 } // Count the number of trips in each week
        }
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.week": 1
        }
      }
    ]);
    const boatOwnerStats = await boatOwner.aggregate([
      {
        $match:{
          createdAt: { $gte: startOfWeek } // Filter trips that started this week
        }
      },
      {
        $group: {
          _id: {
            week: { $isoWeek: "$createdAt" },
            year: { $year: "$createdAt" }
          },
          count: { $sum: 1 } // Count the number of trips in each week
        }
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.week": 1
        }
      }
      
    ]);
    console.log(boatOwnerStats);
    const boatStats = await boats.aggregate([
      {
        $match:{
          createdAt: { $gte: startOfWeek } // Filter trips that started this week
        }
      },
      {
        $group: {
          _id: {
            week: { $isoWeek: "$createdAt" },
            year: { $year: "$createdAt" }
          },
          count: { $sum: 1 } // Count the number of trips in each week
        }
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.week": 1
        }
      }
    ]);

    const stats = {
      userStats,
      tripStats,
      boatOwnerStats,
      boatStats
    };
    console.log(stats);
    res.json(stats); // Return the stats as JSON
  } catch (err) {
    console.error(err);
    res.sendStatus(500); // Send a server error response
  }
});
// ****************************************************

// By week

route.get('/statistics/week', async (req, res) => {
  console.log("ds");
  try {
    const startOfWeek = moment().startOf('week').toDate();
    constendOfWeek = moment().endOf('week').toDate();
    const daysOfWeek = [];
    const newClients = await users.find({ createdAt: { $gte: startOfWeek, $lte: constendOfWeek } });
    const numNewClients = newClients.length;

    // Get trips that took place during the past week
    const trip= await trips.find({ date: { $gte: startOfWeek, $lte: constendOfWeek } });
    const numTrips = trip.length;

    const boats = await trips.aggregate([
      { $match: { date: { $gte: startOfWeek, $lte: constendOfWeek } } },
      { $group: { _id: '$boatId', numTrips: { $sum: 1 } } },
      { $sort: { numTrips: -1 } },
      { $limit: 1 },
      { $lookup: { from: 'boats', localField: '_id', foreignField: '_id', as: 'boat' } },
      { $unwind: '$boat' },
      { $project: { _id: 0, boat: { name: 1, images: 1 }, numTrips: 1 } }
    ]);
        // console.log({ numNewClients, numTrips, mostRequestedBoat: boats });
        daysOfWeek.push({
          daysOfWeek: moment(daysOfWeek).format('dddd'),
        numNewClients,
        numTrips,
        mostRequestedBoat: boats[0] || null
      });
      
        console.log({daysOfWeek  });
    res.json({daysOfWeek });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Export Route Module
module.exports = route;
