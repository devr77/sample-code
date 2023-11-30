const mongoose = require("mongoose");
const slugify = require("slugify");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const moment = require("moment");

const doctorSchema = new mongoose.Schema({
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
  DateOfBirth: {
    type: Date,
  },
  image: {
    type: String,
  },
  slug: String,
  gender: {
    type: String,
    enum: ["male", "female"],
  },
  email: {
    type: String,
    required: [true, "Please Provide your email"],
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
  mobileNoToken: [
    {
      _id: false,
      mobileToken: { type: Number },
      mobileTokenExpire: { type: Number },
      mobileNo: { type: Number },
    },
  ],
  password: {
    type: String,
    required: [true, "Please provide Password"],
    minlength: 8,
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
  hospital: {
    type: mongoose.Schema.ObjectId,
    ref: "Provider",
  },
  education: [
    {
      type: String,
    },
  ],
  introduction: {
    type: String,
  },
  practiceStarted: {
    type: Date,
  },
  specialists: [
    {
      type: String,
    },
  ],
  fees: {
    type: Number,
  },
  category: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
});

doctorSchema.pre("save", function (next) {
  this.slug = slugify(this.firstName.concat(this.lastName), { lower: true });
  next();
});

doctorSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

doctorSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  // False means NOT changed
  return false;
};

doctorSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 15 * 60 * 1000;
  return resetToken;
};

doctorSchema.pre("find", function () {
  this.populate("hospital");
});

doctorSchema.virtual("fullName").get(function () {
  return this.firstName + " " + this.lastName;
});

doctorSchema.virtual("experience").get(function () {
  return moment(this.practiceStarted).fromNow(true);
});

doctorSchema.virtual("imageUrl").get(function () {
  return `https://${process.env.BUCKET}.s3.${process.env.REGION}.amazonaws.com/doctor/${this.image}`;
});

doctorSchema.set("toJSON", {
  transform: (doc, ret, options) => {
    delete ret.__v;
    ret.id = ret._id.toString();
    delete ret._id;
  },
});

const Doctor = mongoose.model("Doctor", doctorSchema);

module.exports = Doctor;
