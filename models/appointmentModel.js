const mongoose = require("mongoose");
const momentz = require("moment-timezone");

const AppointmentSchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.ObjectId,
    ref: "Doctor",
    required: [true, "Appointment must belong to a Doctor"],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "Appointment must belong to a User!"],
  },
  registrator: {
    type: String,
    enum: ["user", "provider"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  firstName: {
    type: String,
    required: [true, "Appointment must contain firstName"],
  },
  lastName: {
    type: String,
    required: [true, "Appointment must contain lastName"],
  },
  reportImage: {
    type: String,
    default: "",
  },
  prescriptionImage: {
    type: String,
    default: "",
  },
  age: {
    type: Number,
    required: [true, "Appointment must contain Age"],
  },
  gender: {
    type: String,
    enum: ["male", "female", "others", ""],
    default: "",
  },
  height: {
    type: String,
  },
  weight: {
    type: String,
  },
  paid: {
    type: Boolean,
    default: false,
  },
  bloodGroup: {
    type: String,
  },
  amountPaid: {
    type: Number,
  },
  paidSource: {
    type: String,
    enum: ["offline", "online"],
    default: "offline",
  },
  onlinePayment: {
    type: Boolean,
    default: false,
  },
  mobileNo: {
    type: String,
    validate(value) {
      if (value.length < 10) {
        throw new Error("Phone is invalid");
      }
    },
  },
  address: {
    type: String,
    required: [true, "Appointment must contain address"],
  },
  city: {
    type: String,
    required: [true, "Appointment must contain city"],
  },
  state: {
    type: String,
    required: [true, "Appointment must contain state"],
  },
  problem: {
    type: String,
  },
  cancelledReason: {
    type: String,
  },
  isCancelled: {
    type: Boolean,
    default: false,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ["Order", "Delivered", "Cancelled", ""],
    default: "",
  },
  submitPreviousReport: {
    type: String,
  },
  prescription: {
    type: String,
  },
  prescriptionTime: {
    type: Date,
  },
  prescriptionNote: { type: String },
  prescriptionNextDate: { type: Date },
  isPrescribed: {
    type: Boolean,
    default: false,
  },
  test: {
    type: String,
  },
  Diagnosed: {
    type: String,
  },
  conclusion: {
    type: String,
  },
});

AppointmentSchema.pre("find", function () {
  this.populate("user");
  this.populate("doctor");
});

AppointmentSchema.virtual("createdInfo").get(function () {
  const m1 = momentz.tz(this.createdAt, "Asia/Kolkata");
  return m1.format("lll");
});

AppointmentSchema.virtual("prescriptionTimeInfo").get(function () {
  const m1 = momentz.tz(this.prescriptionTime, "Asia/Kolkata");
  return m1.format("lll");
});

AppointmentSchema.virtual("fullName").get(function () {
  return this.firstName + " " + this.lastName;
});

AppointmentSchema.virtual("reportImageUrl").get(function () {
  return `https://${process.env.BUCKET}.s3.${process.env.REGION}.amazonaws.com/prescription/${this.reportImage}`;
});

AppointmentSchema.virtual("prescriptionImageUrl").get(function () {
  return `https://${process.env.BUCKET}.s3.${process.env.REGION}.amazonaws.com/prescription/${this.prescriptionImage}`;
});

AppointmentSchema.set("toJSON", {
  transform: (doc, ret, options) => {
    delete ret.__v;
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.mobileNoToken;
    delete ret.image;
  },
});

const Appointment = mongoose.model("Appointment", AppointmentSchema);

module.exports = Appointment;
