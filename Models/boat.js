const mongoose = require("mongoose");
const boatSchema = mongoose.Schema(
  {
    name: {
      type: String,
      // required: true,
      maxLength: 30,
    },
    description: {
      type: String,
      // required: true,
      mminLength: 100,
      // maxLength: 400,
    },
    images: {
      type: [String],
      // required: true,
    },
    price: {
      type: Number,
      // required: true,
    },
    portName: {
      type: String,
      // required: true,
      enum: {
        values: ["KFC", "MAC", "Mahata", "", "", ""],
      },
    },
    type: {
      type: String,
      // required: true,
      enum: {
        values: ["shera3", "swvl", "Dahabiya", "Felucca", "Houseboat", ""],
      },
    },
    category: {
      type: String,
      enum: {
        values: ["swvl", "3nile", "3nile vip",],
      },
      default: "3nile",
    },
    numberOfpeople: {
      type: Number,
      // required: true,
    },
    status: {
      // required:true,
      type: String,
      enum: ["active", "blocked"],
      default: "active",
    },
    offerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Offers",
      default: null,
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "reviews",
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
   
    // availableSeats: {
    //   type: Number,
    // },
  },
  {
    versionKey: false,
    strict: false,
  }
);
const boats = mongoose.model("boats", boatSchema);
module.exports = boats;
