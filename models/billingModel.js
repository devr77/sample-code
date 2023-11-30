const mongoose = require("mongoose");

const BillingSchema = new mongoose.Schema({
  appointment: {
    type: mongoose.Schema.ObjectId,
    ref: "Appointment",
  },
  itemName: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  quantity: {
    type: String,
    required: true,
  },
});

const Billing = mongoose.model("Billing", BillingSchema);

module.exports = Billing;
