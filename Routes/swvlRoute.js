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
const uid = new ShortUniqueId({ length: 4 });

route.use(cors())



// BarCode Test
route.get('/', async (req, res) => {
  const barc = uid();
  const barcode2 = uuid.v4()
  io.emit('User-Finish',{barcode2});

  res.send({barcode2});
  });

// Owner Swvl Trips 
route.get('/boatowner/:id/swvl',async (req, res) => {
  const boatOwnerId = req.params.id;
  try {
    const boatOwnerData = await boatOwner.findById(boatOwnerId);
    if (!boatOwnerData) {
      res.status(404).send('Boat owner not found');
      return;
    }

    const ownerBoatsIds = boatOwnerData.boat;
    const ownerboats = await boats.find({ _id: { $in: ownerBoatsIds } });
    const swvl = await Swvl.find({ boat: { $in: ownerBoatsIds } })
      .populate('boat')
      .exec();

    res.status(200).json(swvl);
  } catch (err) {
    console.log(err);
    res.status(500).send('An error occurred while fetching data');
  }


});


// Boat Owner add Trip 
route.post('/AddTrip', async (req, res) => {
  console.log(req.body)

  try {
    const boat = await boats.findById(req.body.boatId);
    if (!boat) {
      return res.status(404).json({ error: 'Boat not found' });
    }

    const swvl = await Swvl.create({
      boat: req.body.boatId,
      time : req.body.time,
      port:req.body.port,
      targetPlace:req.body.targetPlace,
      date:req.body.date,
      availableSeats:20,
      priceForTrip: req.body.priceForTrip,
    });


    return res.status(201).json({ message: 'Trip created successfully' ,Tripdetails:swvl});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


// Get Trip By Id 
route.get('/swvlTrip/:swvlId', async (req, res) => {
  console.log(req.params.swvlId)
  const swvl = await Swvl.findById(req.params.swvlId).populate("boat");
  console.log(swvl)
  res.send(swvl)
});

// Get all swvl Tripa  
route.get('/swvlTrips', async (req, res) => {
  const swvl = await Swvl.find({}).populate("boat");
  res.send(swvl)
});

// User Book Swvl Trip 
route.post('/userBooking', async (req, res) => {
  const { swvlId, userId, numberOfSeats } = req.body;
  try {
    const swvl = await Swvl.findById(swvlId);
    if (!swvl) {
      return res.status(404).json({ error: 'Swvl trip not found' });
    }
    if (swvl.availableSeats < numberOfSeats ||numberOfSeats<0 ) {
      return res.send({ error: 'Sorry , No enough available seats' })
    }
    const userDetails = await users.findById(userId);
    const bookingBarcode =uid();
    const TripDetails = {
      swvlDetails:swvl,
      numberOfSeats,
      bookingBarcode,
      TotalPrice :numberOfSeats * swvl.priceForTrip
    };
     swvl.availableSeats = swvl.availableSeats - numberOfSeats;
    if(swvl.users.indexOf(userDetails._id)==-1){
      swvl.users.push(userId);
    }
    
    swvl.bookingInfo = [...swvl.bookingInfo, {Barcode:bookingBarcode,numberOfSeats:numberOfSeats,price:numberOfSeats * swvl.priceForTrip}];
    await swvl.save();
    
    let tripNotification = `Client (${userDetails.email}) Has Booked The Trip `
    io.emit('Swvl-booked', {swvl,tripNotification});
    
    return res.status(201).json({ message: 'Swvl trip booked successfully', TripDetails});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
  
});





module.exports = route;