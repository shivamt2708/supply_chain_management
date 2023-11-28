const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  shipment_id: {
    type: String,
    required: [true, "shipment id is required"],
  },
  route:{
    type: Array,
  },
});
module.exports = mongoose.model("ShipmentRoute", userSchema);