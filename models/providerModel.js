const mongoose = require("mongoose");
const slugify = require("slugify");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const moment = require("moment");
const momentz = require("moment-timezone");

const providerSchema = new mongoose.Schema({
  firstName: {
    type: String,
    minlength: 3,
    required: [true, "Please tell your name"],
  },
  lastName: {
    type: String,
    minlength: 3,
    required: [true, "Please tell your name"],
  },
  ProviderName: {
    type: String,
    unique: true,
    default: null,
    maxlength: [40, "A hospital must have less or equal then 40 characters"],
    minlength: [10, "A hospital must have more or equal than 10 characters"],
  },
  image: {
    type: String,
    default: null,
  },
  email: {
    type: String,
    required: [true, "Please Provide email"],
    lowercase: true,
    validate: [validator.isEmail, "Please Provide Correct Email"],
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  emailIdToken: [
    {
      _id: false,
      emailToken: { type: Number },
      emailTokenExpire: { type: Number },
      email: { type: String },
    },
  ],
  mobileNo: {
    type: String,
    validate(value) {
      if (value.length < 10) {
        throw new Error("Phone is invalid");
      }
    },
  },
  isMobileVerified: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
    required: [true, "Please Provide Password"],
    minlength: 9,
    select: false,
  },
  passwordChangedAt: {
    type: String,
    default: "default",
  },
  passwordResetToken: {
    type: String,
    default: "default",
  },
  passwordResetExpires: {
    type: Date,
    default: "",
  },
  slug: String,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  isProfileVerified: {
    type: Boolean,
    default: false,
  },
  description: {
    type: String,
    trim: true,
    default: "",
  },
  licenseAndAffiliation: [
    {
      type: String,
    },
  ],
  DateOfEstablishment: {
    type: Date,
    default: 0,
  },
  Address: {
    type: String,
    default: "",
  },
  locality: {
    type: String,
    default: "",
  },
  city: { type: String, default: "" },
  pinCode: {
    type: Number,
    default: "",
  },
  state: {
    type: String,
    default: "",
  },
  tempMobileNo: {
    type: String,
    validate(value) {
      if (value.length < 10) {
        throw new Error("Phone is invalid");
      }
    },
  },
  mobileNoToken: [
    {
      _id: false,
      mobileToken: { type: Number },
      mobileTokenExpire: { type: Number },
      mobileNo: { type: Number },
    },
  ],
  openTime: {
    type: Date,
  },
  CloseTime: {
    type: Date,
  },
  daysClosed: [
    {
      _id: false,
      type: Number,
    },
  ],
  lat: {
    type: String,
    default: "",
  },
  long: {
    type: String,
    default: "",
  },
});

// providerSchema.pre("save", function (next) {
//   this.slug = slugify(this.hospitalName, { lower: true });
//   next();
// });

providerSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

providerSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    // False means NOT changed
    return false;
  }
};

providerSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 15 * 60 * 1000;
  return resetToken;
};
providerSchema.set("toJSON", {
  transform: (doc, ret, options) => {
    delete ret.__v;
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.mobileNoToken;
    delete ret.image;
  },
});

providerSchema.virtual("fopenTime").get(function () {
  // return moment(this.openTime).format("h:mm:ss a");
  const m1 = momentz.tz(this.openTime, "Asia/Kolkata");
  return m1.format("h:mm a");
});

const Hospital = mongoose.model("Provider", providerSchema);

module.exports = Hospital;
