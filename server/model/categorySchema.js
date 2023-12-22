const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const categorySchema = new Schema({
  cName:{
    type: String,
    required: true,
    unique: true
  },
  image:{
    type: String,
    required: true
  },
  unlist:{
    type: Boolean,
    default: false
  }
})


const categoryDb = mongoose.model("categoryDb",categorySchema)

module.exports = categoryDb;