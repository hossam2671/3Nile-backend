const mongoose = require('mongoose');
const offerSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        maxLength: 50
    },
    description: {
        type: String,
        required: true,
        maxLength: 500
    },
    discount_percentage: {
        type: Number,
        // required: true,
        min: 0,
        max: 100
    },
    start_date: {
        type: Date,
        // required: true,
        default: Date.now
    },
    end_date: {
        type: Date,
        // required: true
    }
}, {
    versionKey: false,
    strict: false
});

const Offer = mongoose.model('Offers', offerSchema);
module.exports = Offer;