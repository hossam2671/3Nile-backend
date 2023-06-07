const express = require("express");
const route = express.Router();
const boat = require("../Models/boat");
const trips = require("../Models/trip");
const boatOwner = require("../Models/boatOwner");
const reviews = require("../Models/Offer");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const ObjectId = require("mongodb").ObjectID;
const mongoose = require("mongoose");
const cors = require("cors")
const path = require("path");
const multer = require("multer");
route.use(express.static(path.join(__dirname, "./uploads")));
route.use(express.static("./uploads"));
route.use(cors())
route.use(cookieParser());
const io = require('../index');// multter img 

const storage = multer.diskStorage({
  destination: function (req, file, callbackfunction) {
    callbackfunction(null, 'uploads')
  },

  filename: function (req, file, callbackfunction) {
    callbackfunction(null, file.originalname)
  }
});

const upload = multer({ storage: storage });
route.use(cookieParser());

// Register :
route.post("/register",
  upload.single("image"),
  async function (req, res) {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    req.body.password = hashedPassword;
    let boatOwnerData = await boatOwner.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      // imgUrl: req.file.filename,
      // 'img':req.body.img
    });
    res.send("data registered");
  });

// Log In :
route.post("/login", async (req, res) => {
  try {
    const boatOwnerData = await boatOwner.findOne({ email: req.body.email });
    if (!boatOwnerData) {
      res.status(401).json({ error: "Invalid credentials" });
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
        res.send(boatOwnerData);
      } else {
        res.send("Invalid Password");
      }
    }
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});





// TEstttt --> React
route.get("/getData:id", async function (req, res) {
  let boatOwnerId = req.body.id
  // // console.log(adminID);
  // // let adminData = await admin.findById(adminID.admin)
  // // console.log(adminData);
  let boatOwnerData = await boatOwner.findById(boatOwnerId.boatOwner);
  console.log(boatOwnerData);
  res.send(boatOwnerData);
});


// 


route.put('/updateData/:id', upload.single('image'), async function (req, res) {
  try {
    const boatOwnerId = req.params.id;
    const updatedData = req.body;

    if (req.file) { // check if an image file was uploaded
      updatedData.img = req.file.filename; // add the file path to the updated data object
    }

    const result = await boatOwner.findByIdAndUpdate(
      boatOwnerId,
      updatedData,
      { new: true }
    );
    console.log(result,"anasHossam@gmail.com");
    console.log("Data updated");
    res.status(200).send(result);
  } catch (error) {
    res.status(400).send(error.message);
  }
});
// 

route.put('/updateDataa/:id', async function (req, res) {
  try {
    const boatOwnerId = req.params.id;
    const updatedData = req.body;

    const result = await boatOwner.findByIdAndUpdate(
      boatOwnerId,
      updatedData,
      { new: true }
    );
    console.log("Data updated");
    res.status(200).send(result);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// get All His boats
route.get("/getAllBoats/:id", async function (req, res) {
  const boatOwnerId = req.params.id;
  let boatOwnerData = await boatOwner.findById(boatOwnerId);
  let data = [];
  for (let i = 0; i < boatOwnerData.boat.length; i++) {
    data.push(await boat.findById(boatOwnerData.boat[i]));
  }

  res.send(data);
});

// add Boat
route.post("/addBoat",
  upload.array("images", 9),
  async function (req, res) {
    // console.log(req.cookies.boatOwnerId);
    console.log(req.files)
    console.log(req.body.boatOwnerId);
    try {
      if (req.files === undefined) {
        res.status(400).send('No files were uploaded.');
        return;
      }
      let multiimages = req.files.map((file) => file.filename);
      // console.log(multiimages)
      let boatData = await boat.create({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        portName: req.body.portName,
        type: req.body.type,
        numberOfpeople: req.body.number,
        images: multiimages,
      });
      // let boatOwnerId = req.cookies.boatOwnerId
      // let boatOwnerId = '646d225031823a799fb95c7b';
      let boatOwnerData = await boatOwner.findByIdAndUpdate(req.body.boatOwnerId, {
        $push: { boat: boatData._id },
      });
          
      res.send(boatOwnerData);
    } catch (err) {
      console.error(err);
      res.status(500).send('Error adding boat!');
    }
  }
);

// delete boat
route.delete("/deleteBoat/:id/:ownerId", async function (req, res) {
console.log(req.params);
  let boatData = await boat.findByIdAndDelete(req.params.id);
  // let boatOwnerId = jwt.verify(req.cookies.boatOwnerId, "3-nile");
  let boatOwnerData = await boatOwner.findById(req.params.ownerId);

  // let data =[]
  let updateBoats;
  for (let i = 0; i < boatOwnerData.boat.length; i++) {
    if (boatOwnerData.boat[i] == req.params.id) {
      boatOwnerData.boat.splice(i, 1);
      console.log(boatOwnerData.boat);
      updateBoats  = await boatOwner.findByIdAndUpdate(
        req.params.ownerId,
        {
          boat: boatOwnerData.boat,
        },
        {new:true}
      );
    }
  }
  console.log(boatOwnerData);
  res.send(boatOwnerData);
});
//get One Boat

route.get("/getOneBoat", async function (req, res) {
  let boatData = await boat.findById(req.body.boatId);
  res.send(boatData);
});

// edit boat
route.get("/getOneBoat", async function (req, res) {
  let boatData = await boat.findById(req.body.id);
  res.send(boatData);
});

route.put("/editBoat/:id",
upload.array("images", 9),
  async function (req, res) {
    console.log(req.files);
    let multiimages = req.files.map((file) => file.filename);
    let boatData = await boat.findByIdAndUpdate(req.params.id, {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      numberOfpeople: req.body.number,
      images: multiimages,
     
    });
    res.send("done");
  });

// get All trips
route.get("/getAllTrips", async function (req, res) {
  let boatOwnerId = jwt.verify(req.cookies.boatOwnerId, "3-nile");
  let boatOwnerData = await boatOwner.findById(boatOwnerId.boatOwner).populate({
    path: "boat",
    model: "boats",
  });

  let tripData = await trips.find({}).populate({
    path: "boatId",
    model: "boats",
  });
  let data = [];
  for (let i = 0; i < boatOwnerData.boat.length; i++) {
    for (let j = 0; j < tripData.length; j++) {
      let tripdatad = tripData[j].boatId;
      let ownerb = boatOwnerData.boat[i];
      if (JSON.stringify(tripdatad) === JSON.stringify(ownerb)) {
        console.log("matched");
        data.push(tripdatad);
      } else {
        console.log(ownerb);
      }
    }
  }

  res.send(data);
});
// get All Pending trips
route.get("/getAllPendingTrips/:id", async function (req, res) {
  console.log(req.params.id);
  const boatOwnerId = req.params.id
  let boatOwnerData = await boatOwner.findById(boatOwnerId).populate({
    path: "boat",
    model: "boats",
  });

  let tripData = await trips.find({status:'pending'}).populate({
    path: "boatId",
    model: "boats",
  });
  let data = [];
  for (let i = 0; i < boatOwnerData.boat.length; i++) {
    for (let j = 0; j < tripData.length; j++) {
      let tripdatad = tripData[j].boatId;
      let ownerb = boatOwnerData.boat[i];
      if (JSON.stringify(tripdatad) === JSON.stringify(ownerb)) {
        console.log("matched");
        data.push(tripdatad);
      } else {
        console.log(ownerb);
      }
    }
  }

  res.send(data);
});
// Get Previous Trips
route.get("/getAllFinishedTrips/:id", async function (req, res) {
  const boatOwnerId = req.params.id
  let boatOwnerData = await boatOwner.findById(boatOwnerId).populate({
    path: "boat",
    model: "boats",
  });

  let tripData = await trips.find({status:'finished'}).populate({
    path: "boatId",
    model: "boats",
  });
  let data = [];
  for (let i = 0; i < boatOwnerData.boat.length; i++) {
    for (let j = 0; j < tripData.length; j++) {
      let tripdatad = tripData[j].boatId;
      let ownerb = boatOwnerData.boat[i];
      if (JSON.stringify(tripdatad) === JSON.stringify(ownerb)) {
        console.log("matched");
        data.push(tripdatad);
      } else {
        console.log(ownerb);
      }
    }
  }

  res.send(data);
});


// Get Boat trips By BoatId 
route.get('/BoatTrip', async (req, res) => {

    let trip = await trips.find({boatId: req.body.boatId})
    console.log(trip.length);
    res.send({length:trip.length})
    
});


// Get avg rate for one boat
// route.get('/BoatAvgRate',async (req, res) => {
//   const { boutId } = req.body;
//   try {
//     const review = await reviews.find({ boutId });
//     const totalRating = review.reduce((sum, review) => sum + review.rating, 0);
//     const averageRating = totalRating / review.length;
//     res.status(200).json({ averageRating });
//     // res.send({averageRating})0
//   } catch (error) {
//     res.status(500).json({ message: 'Something went wrong.' });
//   }
// })
//
// get Trips -->> Status
// uPDATE tRIP STATUS : aCCEPTED , FINISHED , PENDING
module.exports = route;
