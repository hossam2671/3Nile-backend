const mongoose = require('mongoose');

const swvlSchema = mongoose.Schema({
  boat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'boats',
    required: true,
  },
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'clients',
  }],
  barcodeS: [{
    type: String,
    // required: true,
    // unique: true,
  }],
  time: {
    type: String,
    required: true,
  },
  place:{
    required:true,  
    type: String,
    enum: ["KFC", "MAC", "Mahata"],
}  ,
  date: {
    type: Date,
    required: true,
  },
  priceForTrip:{
    type:Number
  },
  availableSeats:{
    type:Number
  },

    status:{
        type: String,
        enum: ['finished', 'pending',"running"],
        default:"pending"
 
  }
 
},
{
    versionKey: false,
    strict: false,
  });

const Swvl = mongoose.model('swvl', swvlSchema);

module.exports = Swvl;