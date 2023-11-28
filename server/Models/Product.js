const mongoose = require("mongoose");
const AdminSchema = new mongoose.Schema({
    sender_email: {
        type: String,
        required: [true, "duration is required"],
    },
    price: {
        type: Number,
        required: [true, "duration is required"],
    },
    name: {
        type: String,
        required: [true, "duration is required"],
    },
    product_id: Number,
});

module.exports = mongoose.model('Product', AdminSchema);