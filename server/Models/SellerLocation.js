const mongoose = require("mongoose");
const AdminSchema = new mongoose.Schema({
    email: { type: String, required: true },
    location: {
      type: { type: String, enum: ['Point'], required: true },
      coordinates: { type: [Number], required: true },
    },
  });

module.exports = mongoose.model('SellerLocation', AdminSchema);