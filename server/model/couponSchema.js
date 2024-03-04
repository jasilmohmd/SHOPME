const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const couponSchema = new Schema({
  couponCode: {
    type: String,
    required: true
  },
  couponDiscount:{
    type: Number,
    required: true
  },
  couponStart: {
    type: Date,
    default: Date.now()
  }
  ,
  couponExpiry: {
    type: Date,
    required: true
  },
  offerType: {
    category:{
      type: String,
      default: "all"
    },
    priceAbove: {
      type: Number,
      default: 1
    }
  }

});

const couponDb = mongoose.model( "coupon", couponSchema );

module.exports = couponDb;