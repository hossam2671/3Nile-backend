const mongoose = require('mongoose');
const clientschema=mongoose.Schema({
   name:{
    type:"string",
    // min:3,
    // max:25,
    require:true
    },
    
    email:{
    type:"string",
    // require:true,
    // unique:true,
    },
    address:{
        type:"string",
        // require:true,
        min:5,
        // default:"aswan",
    },
    phone:{
        type:"string",
        default:""
        // require:true,
        // unique:true,
    },
    img:{
        type: String,
        default: 'pro.png',
    },
    coverImg:{
        type:String,
        default:"cover.jpg"
    },
    passwod:{
        type:"string",
        // require:true,
        // min:8,
        // max:30,
    },
    status:{
        // required:true, 
        type: String,
        enum: ['active', 'blocked'],
        default:'active'
    }
   ,
    trip:[
        {type:mongoose.Schema.Types.ObjectId,ref:"trip"}
    ],
    createdAt:{
        type:Date,
        default:Date.now()
    }
    
},
{
  versionKey:false,
   strict:false,
})
const Client=mongoose.model('clients',clientschema)
module.exports=Client