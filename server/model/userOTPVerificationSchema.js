const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userOTPVerificationSchema = new Schema({
  email: String,
  otp: String,
  createdAt: Date,
  expiresAt: Date
});

const userOTPdb = mongoose.model("userOTPdb",userOTPVerificationSchema)

module.exports = userOTPdb;