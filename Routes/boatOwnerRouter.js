const express = require("express");
const  io  = require('../Socket').get();
const route = express.Router();
const boat = require("../Models/boat");
const trips = require("../Models/trip");
const boatOwner = require("../Models/boatOwner");
const user = require("../Models/client");
const reviews = require("../Models/Offer");
const sizeOf = require('image-size');
const sharp = require('sharp');
const mime = require('mime-types');

const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const ObjectId = require("mongodb").ObjectID;
const mongoose = require("mongoose");
const cors = require("cors")
const path = require("path");
const multer = require("multer");
const Notification = require("../Models/notifications");
route.use(express.static(path.join(__dirname, "./uploads")));
route.use(express.static("./uploads"));
route.use(cors())
route.use(cookieParser());



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
    let existUser = await user.findOne({ email: req.body.email })
    let exist = await boatOwner.findOne({ email: req.body.email })
  console.log(exist);
  if(exist||existUser){
    console.log("email aready exist")
    res.json({
      message: "email aready exist",
      status: 400,
      // data: req.body,
      success: false,
    });
  }else{
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
  req.body.password = hashedPassword;
  let boatOwnerData = await boatOwner.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  //   // 'img':req.body.img
  });
 
    // Emit a 'registration' event to notify the front-end
io.emit("registeration", "A new boat owner has registered!",boatOwnerData);
  console.log("Successfull regestration go to sign-in");
  res.json({
    message: "Successfull regestration go to sign-in",
    status: 200,
    // data: userData,
    success: true,
  });

  }

  });

  
// Log In :
route.post("/login", async (req, res) => {
  console.log("first")
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

// edit owner info mobile
route.put('/update/:id',async function (req , res){
  const boatOwnerData = await boatOwner.findByIdAndUpdate(req.params.id,{
    name:req.body.name,
    phone:req.body.phone,
  })
  const ownerData = await boatOwner.findById(req.params.id)
  res.send(ownerData)
}) 

//edit user image mobile 
route.put('/editImage/:id',upload.single('img'),async function (req,res){
  console.log(req)
  console.log(req.file,"jgjkk")
  const boatOwnerData = await boatOwner.findByIdAndUpdate(req.params.id,{
    img:req.file.filename
  })
  console.log("first")
  res.send(boatOwnerData)

})

//edit owner cover image mobile 
route.put('/editCover/:id',upload.single('img'),async function (req,res){
  console.log("fatma gamila w hoso w7esh")
  console.log(req)
  console.log(req.file,"jgjkk")
  const boatOwnerData = await boatOwner.findByIdAndUpdate(req.params.id,{
    coverImg:req.file.filename
  })
  console.log("first")
  res.send(boatOwnerData)

})

// edit owner info


route.put('/updateData/:id', upload.single('img'), async function (req, res) {
  console.log(req.body);
  try {
    const boatOwnerId = req.params.id;
    const updatedData = req.body;

    if (req.file) { // check if an image file was uploaded
      updatedData.img = req.file.filename; // add the file path to the updated data object
    }

    const boatOwnerData = await boatOwner.findByIdAndUpdate(
      boatOwnerId,
      updatedData,
      { new: true }
    );
    console.log("Data updated");
    let boatOwnerr="boatOwner";
    res.send({boatOwnerData,boatOwnerr});
  } catch (error) {
    res.status(400).send(error.message);
  }
});
// Cover Edit
// route.put('/ownerCover/:id', upload.single('img'), async function (req, res) {
//   console.log(req.file);

//     const boatOwnerId = req.params.id;

//     const boatOwnerData = await boatOwner.findByIdAndUpdate(
//       boatOwnerId,{
//         coverImg:req.file.filename
//       }
     
//     );
//     console.log(boatOwnerData,"Data updated");
//     let boatOwnerr="boatOwner";
//     res.send({boatOwnerData,boatOwnerr});

  
// });
// 
// Cover Edit 


// route.put('/ownerCover/:id', upload.single('img'), async function (req, res) {
//   console.log(req.file);

//   const boatOwnerId = req.params.id;

//   // Read the uploaded image file
//   const imageBuffer = req.file.buffer;

//   // Dynamically import the file-type library
//   const FileType = (await import('file-type')).default;

//   // Get the file type
//   const fileType = await FileType.fileTypeFromBuffer(imageBuffer);

//   // Check if the file type is supported and it is an image
//   if (!fileType || !fileType.mime.startsWith('image/')) {
//     res.json({
//       message: "Invalid Image Type",
//       status: 400,
//       success: false,
//     }); 
//   }

//   // Check the width of the image
//   const imageMetadata = await sharp(imageBuffer).metadata();
//   const imageWidth = imageMetadata.width;
//   const requiredWidth = 800; // Adjust this value to your desired width

//   if (imageWidth !== requiredWidth) {
//     res.json({
//       message: `Invalid image width. Required width: ${requiredWidth}`,
//       status: 400,
//       success: false,
//     });
//   }
//   const boatOwnerData = await boatOwner.findByIdAndUpdate(
//     boatOwnerId,
//     {
//       coverImg: req.file.filename
//     }
//   );

//   console.log(boatOwnerData, "Data updated");

//   let boatOwnerr = "boatOwner";
//   res.json({
//     message: `your Cover Has Been Updated`,
//     status: 200,
//     data:{ boatOwnerData, boatOwnerr },
//     success: false,
//   })
// })



route.put('/ownerCover/:id', upload.single('img'), async function (req, res) {
  console.log(req.file);
  const boatOwnerId = req.params.id;
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
  
  const boatOwnerUpdate= await boatOwner.findByIdAndUpdate(
    boatOwnerId,
    {
      coverImg: req.file.filename
    }
    );
    
    console.log(boatOwnerUpdate ,"Data updated");
      const boatOwnerData = await boatOwner.findById(boatOwnerId)
    let boatOwnerr = "boatOwner";
    res.json({
      message: `your Cover Has Been Updated`,
      status: 200,
      data:{ boatOwnerData, boatOwnerr },
      success: false,
    }); 
    
  }
}
  });

  
    
    
    
    
    // route.put('/ownerCover/:id', upload.single('img'), async function (req, res) {
      //   console.log(req.file);

//   const boatOwnerId = req.params.id;
//   const sharp = require('sharp');
//   const imageBuffer = await sharp(req.file.buffer).toBuffer();

//   const FileType = (await import('file-type')).default;

//   const fileType = await FileType.fromBuffer(imageBuffer);

//   if (!fileType || !fileType.mime.startsWith('image/')) {
//     res.json({
//       message: "Invalid Image Type",
//       status: 400,
//       success: false,
//     }); 

//   }

//   // Check the width of the image
//   const imageMetadata = await sharp(imageBuffer).metadata();
//   const imageWidth = imageMetadata.width;
//   const requiredWidth = 800; // Adjust this value to your desired width

//   if (imageWidth !== requiredWidth) {
//     res.json({
//       message: `Invalid image width. Required width: ${requiredWidth}`,
//       status: 400,
//       success: false,
//     }); 
//   }

//   const boatOwnerData = await boatOwner.findByIdAndUpdate(
//     boatOwnerId,
//     {
//       coverImg: req.file.filename
//     }
//   );

//   console.log(boatOwnerData, "Data updated");

//   let boatOwnerr = "boatOwner";
//   res.json({
//     message: `your Cover Has Been Updated`,
//     status: 200,
//     data:{ boatOwnerData, boatOwnerr },
//     success: false,
//   }); 
//   // res.send({ boatOwnerData, boatOwnerr });
// });





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
      let category ;
      if(req.body.type==="shera3"){
        category = "3nile"
      }else if(req.body.type==="Felucca"){
        category = "3nile"
      }else if(req.body.type==="Houseboat"){
        category = "3nile vip"
      }else if(req.body.type==="Dahabiya"){
        category = "3nile vip"
      }
      else{
        category = "swvl"
      }
      let boatData = await boat.create({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        portName: req.body.portName,
        type: req.body.type,
        category:category,
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

// add Boat mobile
route.post("/addBoatt",
upload.array("images", 9),
  async function (req, res) {
    // console.log(req.cookies.boatOwnerId);
    // console.log(req.files)
    console.log(req.body);
     if (req.files === undefined) {
       res.status(400).send('No files were uploaded.');
       return;
     }
     let multiimages = req.files.map((file) => file.filename);
      try {
       // console.log(multiimages)
       let category ;
       if(req.body.type==="shera3"){
         category = "3nile"
       }else if(req.body.type==="Felucca"){
         category = "3nile"
      }else if(req.body.type==="Houseboat"){
         category = "3nile vip"
       }else if(req.body.type==="Dahabiya"){
        category = "3nile vip"
      }
       else{
        category = "swvl"
       }
       let boatData = await boat.create({
         name: req.body.name,
         description: req.body.description,
         price: req.body.price,
         portName: req.body.portName,
         type: req.body.type,
         category:category,
         images: multiimages,
        numberOfpeople: req.body.numberOfpeople,
      });
       // let boatOwnerId = req.cookies.boatOwnerId
       let boatOwnerData = await boatOwner.findByIdAndUpdate(req.body.id, {
        $push: { boat: boatData._id },
       });

       let boatOwnerData2 = await boatOwner.findById(req.body.id);
       let data = [];
       for (let i = 0; i < boatOwnerData2.boat.length; i++) {
         data.push(await boat.findById(boatOwnerData2.boat[i]));
       }
          
       res.send(data);
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
route.get("/getTripDetails/:id", async function (req, res) {
  let boatData = await boat.findById(req.params.tripId);
  res.send(boatData);
});

// edit boat
// route.get("/getOneBoat", async function (req, res) {
//   let boatData = await boat.findById(req.body.id);
//   res.send(boatData);
// });

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
  console.log(data , "OWner Trip ");

  res.send(data);
});
// getAllPendingTrips
route.get("/getAllPendingTrips/:id", async function (req, res) {
  console.log(req.params.id);
  const boatOwnerId = req.params.id;
  let boatOwnerData = await boatOwner.findById(boatOwnerId).populate({
    path: "boat",
    model: "boats",
  });

  let tripData = await trips.find({ status: 'pending' }).populate({
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
        data.push(tripData[j]);
      } else {
        console.log(ownerb);
      }
    }
  }

  console.log(data, "Owner Trip");
  res.send(data);
});

// getAllFinishedTrips
route.get("/getAllFinishedTrips/:id", async function (req, res) {
  const boatOwnerId = req.params.id;
  let boatOwnerData = await boatOwner.findById(boatOwnerId).populate({
    path: "boat",
    model: "boats",
  });

  let tripData = await trips.find({ status: 'finished' }).populate("boatId").populate("rate");

  let data = [];
  for (let i = 0; i < boatOwnerData.boat.length; i++) {
    for (let j = 0; j < tripData.length; j++) {
      let tripdatad = tripData[j].boatId;
      let ownerb = boatOwnerData.boat[i];
      if (JSON.stringify(tripdatad) === JSON.stringify(ownerb)) {
        console.log("matched");
        data.push(tripData[j]);
      }
    }
  }



  console.log(tripData, "Owner Trip");

  res.send(data);
});


// getAllCurrentTrips
route.get("/getAllCurrentTrips/:id", async function (req, res) {
  const boatOwnerId = req.params.id;
  let boatOwnerData = await boatOwner.findById(boatOwnerId).populate({
    path: "boat",
    model: "boats",
  });

  let tripData = await trips.find({ status: 'accepted' }).populate({
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
        data.push(tripData[j]);
      }
    }
  }
  console.log(data);

  res.send(data);
});


// Get Boat trips By BoatId 
route.get('/BoatTrip', async (req, res) => {

    let trip = await trips.find({boatId: req.body.boatId})
    console.log(trip.length);
    res.send({length:trip.length})
    
});


// Owner CanCel Trip 

route.put('/cancelTrip', async (req, res) => {
  const tripData = await trips.findByIdAndUpdate(req.body.id, {
    status: "cancelled"
  })
  const tripInformation = await trips.findById(req.body.id )

 let tripNotification = "The Trip Canceleld Now "
  io.emit('Owner-Cancel-Trip', {tripInformation,tripNotification});
  let message = tripNotification
  res.send({tripInformation,message})
})
// Owner Accept Trip
route.put('/acceptTrip', async (req, res) => {
  const tripData = await trips.findByIdAndUpdate(req.body.id, {
    status: "accepted"
  })
  const tripInformation = await trips.findById(req.body.id )

 let tripNotification = "The Trip accepted Now " 
 const notification = new Notification({
   message: tripNotification,
   clientId: tripInformation.clientId,
   createdAt:Date.now() ,
   status:'unRead'
  });
  const chatRoomId = tripData._id.toString()
  const owner = await boatOwner.find({boat:tripData.boatId })
  const userData = await user.find({_id:tripData.clientId} )
  io.emit('Owner-accepted-Trip', {notification});
  io.emit('trip-request-accepted', { tripData,owner,userData, notification, chatRoomId: tripData._id.toString() });
  io.emit('join_room', chatRoomId)
  io.to(chatRoomId).emit('join_room', chatRoomId);
  await notification.save();
      let message = tripNotification
  res.send({tripInformation,message})
})    

// Owner finish Trip
route.put('/finishTrip', async (req, res) => {
  const tripData = await trips.findByIdAndUpdate(req.body.id, {
    status: "finished"
})
  const tripInformation = await trips.findById(req.body.id )

 let tripNotification = "The Trip finished Now "
  io.emit('Owner-finished-Trip', {tripInformation,tripNotification});

  let message = tripNotification
  res.send({tripInformation,message})
})


module.exports = route;
