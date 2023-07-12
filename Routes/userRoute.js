const express = require("express");
const  io  = require('../Socket').get();
const route = express.Router();
const users = require("../Models/client");
const boats = require("../Models/boat");
const trips = require("../Models/trip");
const boatOwner = require("../Models/boatOwner");
const reviews = require("../Models/review");
const Comments = require("../Models/userComments");
const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;
const sizeOf = require('image-size');
const sharp = require('sharp');
const mime = require('mime-types');

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
const moment = require('moment-timezone');
const Notification = require("../Models/notifications");

// multter img 
// io.on('connection',(socket)=>{
//   console.log("new User Connectedd");

// })
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
route.post("/register", async function (req, res) {
console.log(req.body)
  let exist = await users.findOne({ email: req.body.email })
  let existOwner = await boatOwner.findOne({ email: req.body.email })

  console.log(exist);
  if(exist||existOwner){
    res.json({
      message: "email aready exist",
      status: 400,
      // data: req.body,
      success: false,
    });
  }else{
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
  req.body.password = hashedPassword;
  let userData = await users.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  //   // 'img':req.body.img
  });
  console.log(userData);
  let numbers = await users.countDocuments();
  io.emit('New User-registerd',numbers)
  res.json({
    message: "Successfull registration, go to sign-in",
    status: 200,
    // data: userData,
    success: true,
  });

  }



});
// Multer Images End 





// Log In :
route.post("/login", async (req, res) => {
  try {
    const userData = await users.findOne({ email: req.body.email });
    if (!userData) {
      res.json({
        message: "Error:invalid credentials , No account found",
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
        const token = jwt.sign({ user: userData._id }, "3-nile");
        // Set The Id In Cookie With Encryption
        // res.cookie("userId", token, { maxAge: 900000, httpOnly: true });
        res.send(userData);
        
      } else {
        res.json({
          message: "Error:invalid credentials , password incorrect",
          status: 401,
          data: req.body,
          success: false,
        });    }
    }
  } catch (err) {
    res.json({
      message: "Error:invalid credentials , password Or Email incorrect ",
      status: 401,
      data: req.body,
      success: false,
    });   }
});

//edit user image mobile
route.put('/editImage/:id',upload.single('img'),async function (req,res){
  console.log(req.file)
  const userData = await users.findByIdAndUpdate(req.params.id,{
    img:req.file.filename
  })
  console.log("first")
  res.send(userData)
})

//edit user cover image mobile 
route.put('/editCover/:id',upload.single('img'),async function (req,res){
  console.log(req)
  console.log(req.file,"jgjkk")
  const userData = await users.findByIdAndUpdate(req.params.id,{
    coverImg:req.file.filename
  })
  console.log("first")
  res.send(userData)
})


// Find User By ID 


route.get("/userInfo/:id", async (req, res) => {
  const userData = await users.findById(req.params.id);
  res.send(userData);
});

// Find User By Id And Send Identical Obj 
route.get("/userInfoIdentical/:id", async (req, res) => {
  console.log(req.params)
  const userData = await users.findById(req.params.id);
  console.log(userData,"doneeeeeeeeeeeeeeeeeee")
  let user = 'user'
  res.send({userData,user});
});
// edit user info 

route.put("/editUserinfo/:id",
  upload.single("img"),
  async function (req, res) {
    console.log("dddd")
  let data ;
    console.log(req.body,"BODY")
    console.log(req.params.id)
    let editUserinfo = await users.findByIdAndUpdate(req.params.id, {
      name: req.body.name,
      address:req.body.address,
      phone:req.body.phone,
       img: req?.file?.filename,
    }).then((res)=>{
      console.log(res,"dsada");
      data= res
    })
    let usery = await users.findById(req.params.id)
    console.log(usery)
    res.send(usery);
  });


  // User cover 




  route.put('/userCover/:id', upload.single('img'), async function (req, res) {
    console.log(req.file);
    const userID = req.params.id;
    if (!req.file||req.file===undefined) {
      
      res.json({
              message: `Invalid image ,Try Again`,
              status: 400,
              success: false,
            }); 
    }else{
  
    
    const imageDimensions = sizeOf(req.file.path);
    const imageWidth = imageDimensions.width;
    const requiredWidth = 1000; 
     if (!req.file.mimetype.startsWith('image/')) {
          res.json({
            message: "Invalid Image Type",
            status: 400,
            success: false,
          }); 
      
        }
        
    else if (imageWidth < requiredWidth) {
      console.log(`Invalid image width. Required width: ${requiredWidth}`)
      res.json({
              message: `Invalid image width. Required width: ${requiredWidth}`,
              status: 400,
              success: false,
            }); 
    }
   
  else{
    
    const userUpdate= await users.findByIdAndUpdate(
      userID,
      {
        coverImg: req.file.filename
      }
      );
      
        const userData = await users.findById(userID)

          let user = "user";
          res.json({
            message: `your Cover Has Been Updated`,
            status: 200,
            data:{ userData, user },
            success: false,
          })

      
    }
  }
    });
      
      

  // User Cover End 

//get all boats
route.get("/boats", async (req, res) => {
  const allBoats = await boats.find();
  res.send(allBoats);
});
// Get notifications
route.get("/notifications/:id", async (req, res) => {
  console.log(req.params.id);
  try {
    const allNotifications = await Notification.find({ clientId: req.params.id });
    const readNotifications = allNotifications.filter(notification => notification.status === "read");
    const unreadNotifications = allNotifications.filter(notification => notification.status === "unRead");

    const response = {
      readNotifications,
      unreadNotifications
    };

    console.log(response);
    res.send(response);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

// Make As Read 

route.put("/notifications/:id/mark-as-read", async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, status: "unRead" },
      { $set: { status: "read" } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).send("Notification not found or already marked as read.");
    }

    console.log(notification);
    res.send(notification);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

//get all boats in category 1

route.get("/category/3nile/boats", async (req, res) => {
  const firCatBoats = await boats.find({ category: "3nile" ,status: { $ne: "blocked" }});
  // console.log(firCatBoats);
  res.send(firCatBoats);
});

//get all boats in category 2
route.get("/category/3nileplus/boats", async (req, res) => {
  const secCatBoats = await boats.find({ category: "3nileplus",status: { $ne: "blocked" } });
  res.send(secCatBoats);
});

//get all boats in category 3
route.get("/category/3nilevip/boats", async (req, res) => {
  const thiCatBoats = await boats.find({ category: "3nile vip",status: { $ne: "blocked" } });
  res.send(thiCatBoats);
});

// Get One Boat : description Page
route.get('/boat/:id', async (req, res) => {
  const boatData = await boats.findById(req.params.id)
  try {
    const numOfReviews = await reviews.find({ boatId: req.params.id });
    const totalReviews = numOfReviews.length
    const totalRating = numOfReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / numOfReviews.length;
    res.status(200).json({ totalReviews, averageRating, boatData });
    // res.send({averageRating})
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong.' });
  }
})

// aDD tRIP Test one
// route.post('/addTrip/:boatId/:clientId', async (req, res) => {
//       const boatData = await boats.findById(req.params.boatId);

//   console.log(req.body,"body");
// console.log(req.body.date,req.body.startTime);
//   // Create a JavaScript Date object using the date and start time values
//   const { date, startTime } = req.body;

//   // Convert the date string to a JavaScript Date object
//   const tripDate = new Date(date + ' ' + (new Date()).getFullYear() + ' ' + startTime);
//       console.log(tripDate);
//   const tripData = await trips.create({
//     boatId: req.params.boatId,
//     hours: req.body.hours,
//     price: boatData.price * req.body.hours,
//     startTime: tripDate, // Store as Date type
//     date: tripDate, // Store as Date type
//     clientId: req.params.clientId,
//     status: 'pending'
//   });

//   console.log(tripData);
//   // // Socket
//   // let tripNotification = "You Got A New Trip Request"
//   // io.emit('You-Got-New-Trip-Request', { tripData, tripNotification });
//   // console.log("Your Trip Booked Successfully, Please Wait Until BoatOwner Accepts It");

//   res.json({
//     message: "Your Trip Booked Successfully, Please Wait Until BoatOwner Accepts It",
//     status: 200,
//     // data: tripData,
//     success: true,
//   });
// });
// aDD tRIP Test Two
// route.post('/addTrip/:boatId/:clientId', async (req, res) => {
//   try {
//     const boatData = await boats.findById(req.params.boatId);

//     // Check if the boat has any existing trips at the specified start time and date
//     const existingTrip = await trips.findOne({
//       boatId: req.params.boatId,
//       startTime: req.body.startTime,
//       date: req.body.date,
//       status: { $ne: 'cancelled' } // Exclude cancelled trips
//     });

//     if (existingTrip) {
//       console.log("The boat already has a trip scheduled at this time and date.");
//       return res.json({
//         message: "The boat already has a trip scheduled at this time and date.",
//         status: 201,
//         data: existingTrip,
//         success: false,
//       });
//     }

//     // Check if there are any ongoing trips for the boat
//     const ongoingTrip = await trips.findOne({
//       boatId: req.params.boatId,
//       status: { $in: ['pending', 'accepted'] }, // Consider pending and accepted trips
//       date: { $lt: req.body.date } // Filter trips with dates earlier than the current trip date
//     });

//     if (ongoingTrip) {
//       console.log(ongoingTrip);
//       // Check if the hours of the ongoing trip have finished
//       const tripEndDateTime = new Date(ongoingTrip.startTime);
//       console.log(tripEndDateTime);
//      let end= tripEndDateTime.setHours(tripEndDateTime.getHours() + ongoingTrip.hours);
//      console.log(end);
//       const currentDateTime = new Date();

//       if (currentDateTime < tripEndDateTime) {
//         console.log("The boat cannot be booked until the ongoing trip hours have finished.");
//         return res.json({
//           message: "The boat cannot be booked until the ongoing trip hours have finished.",
//           status: 201,
//           data: ongoingTrip,
//           success: false,
//         });
//       }
//     }

//     // No conflicting trips found and trip hours have finished, proceed with creating the new trip
//     const tripData = await trips.create({
//       boatId: req.params.boatId,
//       hours: req.body.hours,
//       price: boatData.price * req.body.hours,
//       startTime: req.body.startTime,
//       date: req.body.date,
//       clientId: req.params.clientId,
//       status: 'pending'
//     });

//     // Socket
//     let tripNotification = "You Got A New Trip Request";
//     io.emit('You-Got-New-Trip-Request', { tripData, tripNotification });
//     console.log("Your Trip Booked Successfully, Please Wait Until Boat Owner Accepts It");
//     return res.json({
//       message: "Your Trip Booked Successfully, Please Wait Until Boat Owner Accepts It",
//       status: 200,
//       data: tripData,
//       success: true,
//     });
//   } catch (error) {
//     console.error('Error adding trip:', error);
//     return res.status(500).json({ message: 'An error occurred while adding the trip.' });
//   }
// });


route.post('/addTrip/:boatId/:clientId', async (req, res) => {
      const boatData = await boats.findById(req.params.boatId);
  console.log(req.body, "body");
  const { date, startTime, hours } = req.body;
  const tripDate = new Date(date + ' ' + (new Date()).getFullYear() + ' ' + startTime);
  console.log(tripDate,"Trip Date");




  const endTime = new Date(tripDate.getTime() + hours * 60 * 60 * 1000);
  const isAvailable = await trips.findOne({
    boatId: req.params.boatId,
    startTime: {
      $lte: endTime,
    },
    endTime: {
      $gte: tripDate,
    },
  });

  if (isAvailable) {
    return res.json({
                message: "The boat is already booked during the specified period. Please choose a different time",
                status: 201,
                // data: ongoingTrip,
                success: false,
              });
  }

  const tripData = await trips.create({
    boatId: req.params.boatId,
    hours: hours,
    price: boatData.price * hours,
    startTime: tripDate, 
    endTime: endTime,
    clientId: req.params.clientId,
    status: 'pending'
  });

  console.log(tripData);
  // Socket
  let tripNotification = "You Got A New Trip Request"
  io.emit('You-Got-New-Trip-Request', { tripData, tripNotification });
  console.log("Your Trip Booked Successfully, Please Wait Until BoatOwner Accepts It");

  res.json({
    message: "Your Trip Booked Successfully, Please Wait Until BoatOwner Accepts It",
    status: 200,
    data: tripData,
    success: true,
  });
})








// cancel trip
route.put('/cancelTrip', async (req, res) => {
  const tripData = await trips.findByIdAndUpdate(req.body.id, {
    status: "cancelled"
  })

  const tripInformation = await trips.findById(req.body.id )

 let tripNotification = "The Trip Canceleld Now "
  io.emit('User-Cancel-Trip', {tripInformation,tripNotification});

  res.send(tripInformation)
})





// fininsh trip
route.put('/finishTrip', async (req, res) => {
  const tripData = await trips.findByIdAndUpdate(req.body.id, {
    status: "finished"
  })

  const tripInformation = await trips.findById(req.body.id )

  let tripNotification = "Client Has Finished The Trip "
   io.emit('User-Finish-Trip', {tripInformation,tripNotification});
  res.send(tripInformation)
})


// get all user trips

route.get('/userTrips', async (req, res) => {
  let id = jwt.verify(req.cookies.userId, "3-nile");
  const userTrips = await trips.find({ clienId: id })
  res.send(userTrips)
})
route.get('/userTripData/:id', async (req, res) => {
  let id = req.params.id
  console.log(id)
  
  const userTripData = await trips.findById(id)
  console.log(userTripData,"userTripData")

  res.send(userTripData)
})
// get all user finished trips

route.get('/userTrips/finished/:id', async (req, res) => {
  let id=new ObjectId( req.params.id)
  const userTrips = await trips.find({$and:[ {clientId:id},{ status: "finished"}] }).populate("boatId").populate("rate")
  res.send(userTrips)
})
// get all user pending trips

route.get('/userTrips/pending/:id', async (req, res) => {
  // const userId = new mongoose.Types.ObjectId(req.params.id);
  console.log(req.params.id)
  let id=new ObjectId(req.params.id)
  console.log(id)
  const userTrips = await trips.find({$and:[ {clientId:id},{ status: "pending"}] }).populate("boatId")
  console.log(userTrips)
  res.send(userTrips)
})

// get all user accepted trips
route.get('/userTrips/accepted/:id', async (req, res) => {
  let id=new ObjectId( req.params.id)
  const userTrips = await trips.find({$and:[ {clientId:id},{ status: "accepted"}] }).populate("boatId").populate("rate")
  res.send(userTrips)
})
// Get Owner Chat Data 
route.get('/userTrip/:id', async (req, res) => {
  let id=new ObjectId( req.params.id)
  const userTrip = await trips.findById(id)
  const ownerData = await boatOwner.find({boat:userTrip.boatId})
  res.send({ownerData,userTrip})
})

// Create a new review
route.post("/addReview", async (req, res) => {
  try {
    const findTrip = await reviews.find({ tripId: req.body.tripId });
    
    const review = await reviews.create({
      boatId: req.body.boatId,
      clientId: req.body.clientId,
      tripId: req.body.tripId,
      rating: req.body.rating,
      // comment: req.body.comment,
    });
    io.emit("user Rate")
    const tripData = await trips.findByIdAndUpdate(req.body.tripId,{rate:review._id})
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



// Top RAted Boats  : 



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



// Contact Us Page ,User Send Massage 
route.post('/contactUs', async (req, res) => {
  console.log(req.body);
  const message = await Comments.create({
    name: req.body.name,
    email: req.body.email,
    message: req.body.message,
    userId: req.body.userId 
  });

  try {
    await message.save();
    console.log(message);
    const userMassage = await Comments.findById(message._id)
    if(userMassage){
        io.emit("user Comment")
      let message = 'You Message sent successfully!'
      res.json({
        message: "You Message sent successfully!",
        status: 201,
        data: userMassage,
        success: true,
      })
    }

  } catch (error) {
    res.status(400).send(error);
  }
});





module.exports = route;
