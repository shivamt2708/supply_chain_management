const mongoose = require("mongoose");
const AdminSchema = new mongoose.Schema({
    email: { type: String, required: true },
    location: {
      type: { type: String, enum: ['Point'], required: true },
      coordinates: { type: [Number], required: true },
    },
    ware_house: String,
  });

module.exports = mongoose.model('ManagerLocation', AdminSchema);