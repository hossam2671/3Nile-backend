const mongoose = require('mongoose');

const reviewSchema =mongoose.Schema({
  boatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'boat'
  },
  tripId: {
    uniqe:true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'trip'
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'client'
  },

  rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        maxLength: 500
    },
    createdId:{
      type:Date
      
    }
}, 
{
    versionKey: false,
    timestamps: true
});


const reviews = mongoose.model('reviews', reviewSchema);

module.exports = reviews;
// 

