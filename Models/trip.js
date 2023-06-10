const mongoose = require('mongoose');
const tripSchema=mongoose.Schema({
    boatId:{
        required:true,
        type:mongoose.Schema.Types.ObjectId,ref:"boats",
        },
    price:{
        // required:true,
        type:Number,
        },
    startTime:{
        // required:true,
        type:String,
        },
    hours:{
        // required:true,
        type:Number,
        },
    date:{
        // required:true,
        type:String,
        },
    clientId:{
        // required:true,
        type:mongoose.Schema.Types.ObjectId,ref:"clients",
        },
    clientsId:[{type:mongoose.Schema.Types.ObjectId,ref:"clients"}],
    emptySeats:{
        // required:true,
        type:Number,
        },
    rate:{
        type:mongoose.Schema.Types.ObjectId,ref:"reviews",
        },
        status:{
            required:true, 
                   // required:true, 
            type: String,
            enum: ['finished', 'pending',"accepted","cancelled"],
}  
},
{
    strict:false,
    versionKey:false,
});


const trip=mongoose.model('trips',tripSchema)

module.exports=trip;