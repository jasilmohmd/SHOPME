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
  }]
})

const cartDb = mongoose.model("cart",cartSchema);

module.exports = cartDb;