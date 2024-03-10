const mongoose = require("mongoose");

const { ObjectId } = mongoose.Types;

const Schema = mongoose.Schema;

const cartSchema = new Schema({
  userId: {
    type: ObjectId,
    required: true
  },
  cartItems: [{
    productId:{
      type: ObjectId,
      required:true
    },
    quantity:{
      type: Number,
      required: true
    }
  }],
  appliedCoupon: {
    type: String,
    default: null
  },
  couponDiscount: {
    type: Number,
    default: 0
  }
})

const cartDb = mongoose.model("cart",cartSchema);

module.exports = cartDb;