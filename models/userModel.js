const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const moment = require("moment");

const userSchema = new mongoose.Schema({
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
  image: {
    type: String,
    default: "",
  },
  gender: {
    type: String,
    enum: ["male", "female", "others", ""],
    default: "",
  },
  bloodGroup: {
    type: String,
    enum: ["a+", "a-", "b+", "b-", "o+", "o-", "ab+", "ab-", ""],
    default: "",
  },
  mobileNo: {
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
  emailIdToken: [
    {
      _id: false,
      emailToken: { type: Number },
      emailTokenExpire: { type: Number },
      email: { type: String },
    },
  ],
  isProfileVerified: {
    type: Boolean,
    default: false,
  },
  isMobileVerified: {
    type: Boolean,
    default: false,
  },
  height: {
    type: Number,
    default: "",
  },
  weight: {
    type: Number,
    default: "",
  },
  DateOfBirth: {
    type: Date,
    default: "",
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  email: {
    type: String,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("email is invalid");
      }
    },
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
    minlength: 8,
    select: false,
  },
  DoPasswordExists: {
    type: Boolean,
    default: false,
  },
  passwordChangedAt: {
    type: String,
    default: "",
  },
  passwordResetToken: {
    type: String,
    default: "",
  },
  passwordResetExpires: {
    type: Date,
    default: "",
  },
  hAddress: {
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
  // passwordConfirm: {
  //     type: String,
  //     required: [true, 'Please confirm your password'],
  //     validate: {
  // This only works on CREATE and SAVE!!!
  //       validator: function(el) {
  //         return el === this.password;
  //       },
  //       message: 'Passwords are not the same!'
  //     }},
  // tokens: [
  //   {
  //     token: {
  //       type: String,
  //       required: true,
  //     },
  //   },
  // ],
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  firebaseToken: {
    type: String,
    default: "",
  },
  isDisabled: {
    type: Boolean,
    default: false,
  },
  lastLogin: {
    type: Date,
    default: "",
  },
});

userSchema.pre("find", function () {
  this.where({ isDisabled: false });
});

userSchema.pre("findOne", function () {
  this.where({ isDisabled: false });
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
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

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 15 * 60 * 1000;
  return resetToken;
};

userSchema.virtual("fullName").get(function () {
  return this.firstName + " " + this.lastName;
});

userSchema.virtual("age").get(function () {
  return moment(this.DateOfBirth).fromNow(true).split(" ")[0];
});

userSchema.virtual("imageUrl").get(function () {
  return `https://${process.env.BUCKET}.s3.${process.env.REGION}.amazonaws.com/user/${this.image}`;
});

userSchema.virtual("DateOfBirths").get(function () {
  return moment(this.DateOfBirth).format("DD/MM/YYYY");
});

userSchema.set("toJSON", {
  transform: (doc, ret, options) => {
    delete ret.__v;
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.mobileNoToken;
    delete ret.emailIdToken;
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
