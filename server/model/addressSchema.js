const mongoose = require("mongoose");

const { ObjectId } = mongoose.Types;

const Schema = mongoose.Schema;

const addressSchema = new Schema({
  userId: {
    type: ObjectId,
    required: true
  },
  addresses: 
  [
    {
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
      },
      default: {
        type: Boolean
      }
    }
  ]
  
  
})

const addressDb = mongoose.model("addresse",addressSchema);

module.exports = addressDb