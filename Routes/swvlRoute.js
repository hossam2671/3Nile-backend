const express = require("express");
const  io  = require('../Socket').get();
const route = express.Router();
const users = require("../Models/client");
const boats = require("../Models/boat");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const Swvl = require("../Models/swvl");
const uuid = require('uuid');
route.use(cors())



// BarCode Test
route.get('/', async (req, res) => {
  const barcode2 = uuid.v4()
  console.log(barcode2);
  io.emit('User-Finish',{barcode2});

  res.send({barcode2});
  });


// Boat Owner add Trip 
route.post('/AddTrip', async (req, res) => {

  try {
    const boat = await boats.findById(req.body.boatId);
    console.log(boat);
    if (!boat) {
      return res.status(404).json({ error: 'Boat not found' });
    }

    const swvl = await Swvl.create({
      boat: req.body.boatId,
      time : req.body.time,
      place:req.body.place,
      date:req.body.date,
      availableSeats:boat.numberOfpeople,
      priceForTrip: req.body.price,
    });


    return res.status(201).json({ message: 'Swvl trip created successfully' ,Tripdetails:swvl});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


// Get Trip By Id 
route.get('/swvlTrip', async (req, res) => {
  const swvl = await Swvl.findById(req.body.swvlId);
  res.send(swvl)

});

// User Book Swvl Trip 
route.post('/book', async (req, res) => {
  console.log(req.body);
  const { swvlId, userId, numberOfSeats } = req.body;
  try {
    const swvl = await Swvl.findById(swvlId);
    if (!swvl) {
      return res.status(404).json({ error: 'Swvl trip not found' });
    }
    if (swvl.availableSeats < numberOfSeats) {
      return res.status(400).json({ error: 'No enough available seats' });
    }
    const userDetails = await users.findById(userId);
    const bookingBarcode =uuid.v4();
    const TripDetails = {
      swvlDetails:swvl,
      numberOfSeats,
      bookingBarcode,
      TotalPrice :numberOfSeats * swvl.priceForTrip
    };
    let tripNotification = `Client (${userDetails.email}) Has Booked The Trip `
    io.emit('Swvl-booked', {swvl,tripNotification});
    swvl.users.push(userId);
    swvl.availableSeats = swvl.availableSeats- numberOfSeats;
    swvl.barcodeS = [...swvl.barcodeS, bookingBarcode];
    await swvl.save();
    

    return res.status(201).json({ message: 'Swvl trip booked successfully', TripDetails});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
  
});




module.exports = route;