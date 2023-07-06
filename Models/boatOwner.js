const mongoose = require("mongoose")
const ownerSchema = mongoose.Schema({
    name:{
        type: String,
        // required: true,
        // minLength:3,
        // maxLength: 25,
    },
    email:{
        type: String,
        // required: true,
        // unique:true,
    },
    password:{
        type: String,
        // required: true,
        // minLength:8,
        // maxLength: 30,
    },
    phone:{
        type: String,
        // required: true,
        // unique:true,
    },
    img:{
        type:String,
        default: 'pro.png',
    },
    coverImg:{
        type:String,
        default:"cover.jpg"
    },
    boat:
        [
            {type:mongoose.Schema.Types.ObjectId,
                ref:"boat"}
        ]
    ,
    address:{
        type:String,
        // required: true,
        minLength:5,
        maxLength: 50,
    },
    status:{
       
        type: String,
        enum: ['pending', 'accepted'],
        default:'pending'
    },
    createdAt:{
        type:Date,
        default:Date.now()
    }        
},{
    strict:false,
    versionKey:false
})
const boatOwner=mongoose.model('boatOwners',ownerSchema)
module.exports=boatOwner