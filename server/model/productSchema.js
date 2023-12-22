const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const productSchema = new Schema({
  pName:{
    type: String,
    required: true
  },
  bName:{
    type: String,
    required: true
  },
  category:{
    type: String,
    required: true
  },
  subTitle:{
    type: String,
    required: true
  },
  descriptionHead:{
    type: String,
  },
  description:{
    type: String,
    required: true
  },
  firstPrice:{
    type: Number,
    required:true
  },
  lastPrice:{
    type: Number,
    required: true
  },
  discount:{
    type: Number,
    required: true
  },
  colour:{
    type: String,
    required: true
  },
  inStock:{
    type: Number,
    required: true
  },
  image:[
    {
      type: String,
      required:true
    }
  ],
  new:{
    type: Boolean,
    default: false
  },
  unlist:{
    type: Boolean,
    default: false
  }
})


const productDb = mongoose.model("productDb",productSchema)

module.exports = productDb;