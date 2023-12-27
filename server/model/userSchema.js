const mongoose = require("mongoose");

var schema = new mongoose.Schema({
  name:{
    type: String,
    required:true
  },
  email:{
    type: String,
    required:true,
    unique:true,
  },
  phone:{
    type: Number,
    required: true,
    unique: true
  },
  password:{
    type: String,
    required:true
  },
  isBlocked:{
    type: Boolean,
    default: false
  },
  status:{
    type: String,
    default: "Inactive"
  }
})

const Userdb = mongoose.model("userdb",schema);

module.exports = Userdb