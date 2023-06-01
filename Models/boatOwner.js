const mongoose = require("mongoose")
const ownerSchema = mongoose.Schema({
    name:{
        type: String,
        required: true,
        minLength:3,
        maxLength: 25,
    },
    email:{
        type: String,
        required: true,
        unique:true,
    },
    password:{
        type: String,
        required: true,
        minLength:8,
        // maxLength: 30,
    },
    phone:{
        type: String,
        // required: true,
        // unique:true,
    },
    imgUrl:{
        type:String,
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
        required:true, 
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