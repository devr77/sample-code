const mongoose = require("mongoose");

const verificationSchema = new mongoose.Schema({
  email: {
    type: String,
  },
  mobileNo: {
    type: String,
  },
  passwordResetToken: {
    type: String,
    default: "",
  },
  passwordResetExpires: {
    type: Date,
    default: "",
  },
});

const Verification = mongoose.model("Verification", verificationSchema);

module.exports = Verification;
