const mongoose = require("mongoose");

const PrescriptionDetailSchema = new mongoose.Schema({
  prescriptionName: {
    type: mongoose.Schema.ObjectId,
    ref: "PrescriptionName",
  },
  Sno: {
    type: Number,
  },
  note: {
    type: String,
    required: [true, "Please Provide note"],
  },
  time:{
    type:String,
  }
});

PrescriptionDetailSchema.set("toJSON", {
  transform: (doc, ret, options) => {
    delete ret.__v;
    ret.id = ret._id.toString();
    delete ret._id;
  },
});
const PrescriptionDetail = mongoose.model(
  "PrescriptionDetail",
  PrescriptionDetailSchema
);

module.exports = PrescriptionDetail;
