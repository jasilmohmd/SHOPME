const mongoose = require("mongoose");

const { ObjectId } = mongoose.Types;

const Schema = mongoose.Schema;

const orderSchema = new Schema({
  userId: {
    type: ObjectId,
    required: true
  },
  orderItems: [{
    productId:{
      type: ObjectId,
      required: true,
    },
    quantity:{
      type: Number,
      required: true
    },
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
    price:{
      type: Number,
      required: true
    },
    mrp:{
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
    image:[
      {
        type: String,
        required:true
      }
    ],
    orderStatus:{
      type: String,
      default:"pending",
      required: true
    }
  }],
  paymentMethod:{
    type: String,
    required: true
  },
  orderDate:{
    type: Date,
    default: Date.now()
  },
  address:{
    name: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    phone: {
      type: Number,
      required: true
    },
    district: {
      type: String,
      required: true
    },
    pincode: {
      type: Number,
      required: true
    }
  }
},{timestamps : true})

const orderDb = mongoose.model("order", orderSchema);

module.exports = orderDb;