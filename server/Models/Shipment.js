const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  shipment_id: {
    type: String,
    required: [true, "shipment id is required"],
  },
  sender_email: {
    type: String,
    required: [true, "sender's email address is required"],
  },
  buyer_email: {
    type: String,
    required: [true, "buyer's email address is required"],
  },
  current_authority: {
    type: String,
    required: [true, "current authority is required"],
  },
  next_authority: {
    type: String,
    required: [true, "next authority is required"],
  },
  duration: {
    type: Number,
    required: [true, "duration is required"],
  },
  status: {
    type: String,
  },
  action: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
});

module.exports = mongoose.model("Shipment", userSchema);