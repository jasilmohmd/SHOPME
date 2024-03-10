const mongoose = require("mongoose");


const { ObjectId } = mongoose.Types;

const Schema = mongoose.Schema;

const walletSchema = new Schema({
  
  userId:{
    type: ObjectId,
    required: true
  },
  balance:{
    type: Number,
    default: 0
  },
  transactions:[
    {
      date: {
        type: Date,
        default: Date.now(),
        required: true
      },
      transactType:{
        type: Boolean,
        required: true
      },
      amount:{
        type: Number,
        required: true
      },
      formattedDate: {
        type: String // Or whatever type you prefer for storing formatted date
      }
    }
  ]

  
})


const walletDb = mongoose.model("walletdb", walletSchema);

module.exports = walletDb;