const mongoose = require('mongoose');

const tripSchema = mongoose.Schema({
  boatId: {
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: "boats",
  },
  price: {
    type: Number,
  },
  startTime: {
    type: Date,
  },
  endTime: {
    type: Date,
  },
  hours: {
    type: Number,
  },
  userMessages: [
    {
      message: {
        type: String, 
        required: true
      },
      time: {
        type: Date,
        required: true
      }
    }
  ],
  boatOwnerMessages: [
    {
      message: {
        type: String, 
        required: true
      },
      time: {
        type: Date,
        required: true
      }
    }
  ]
  ,
  date: {
    type: Date,
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "clients",
  },
  clientsId: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "clients",
  }],
  rate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "reviews",
  },
  status: {
    required: true,
    type: String,
    enum: ['finished', 'pending', 'accepted', 'cancelled'],
    default: "pending",
  }
}, {
  strict: false,
  versionKey: false,
});

// Add a pre-save hook to calculate the endTime based on startTime and hours
tripSchema.pre('save', function(next) {
  if (this.startTime && this.hours) {
    this.endTime = new Date(this.startTime.getTime() + this.hours * 60 * 60 * 1000);
  }
  next();
});

const trip = mongoose.model('trips', tripSchema);

module.exports = trip;


// const mongoose = require('mongoose');
// const tripSchema=mongoose.Schema({
//     boatId:{
//         required:true,
//         type:mongoose.Schema.Types.ObjectId,ref:"boats",
//         },
//     price:{
//         // required:true,
//         type:Number,
//         },
//     startTime:{
//         // required:true,
//         type:String,
//         },
//     hours:{
//         // required:true,
//         type:Number,
//         },
//     date:{
//         // required:true,
//         type:String,
//         },
//     clientId:{
//         // required:true,
//         type:mongoose.Schema.Types.ObjectId,ref:"clients",
//         },
//     clientsId:[{type:mongoose.Schema.Types.ObjectId,ref:"clients"}],
  
//     rate:{
//         type:mongoose.Schema.Types.ObjectId,ref:"reviews",
//         },
//         status:{
//             required:true, 
//                    // required:true, 
//             type: String,
//             enum: ['finished', 'pending',"accepted","cancelled"],
//             default:"pending",
// }  
// },
// {
//     strict:false,
//     versionKey:false,
// });


// const trip=mongoose.model('trips',tripSchema)

// module.exports=trip;