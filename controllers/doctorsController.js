const Doctor = require("../models/doctorsModel");
const Prescription = require("../models/prescriptionNameModel");
const Feedback = require("../models/feedbackModel");
const PrescriptionDetail = require("../models/prescriptionDetailModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const AuthFactory = require("./authController");
const jwt = require("jsonwebtoken");
const Image = require("./ImageController");
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 600 });

exports.doctors = catchAsync(async (req, res, next) => {
  // if (req.hostname !== process.env.DOMAIN_URL) {
  //   throw new Error("Wrong domain");
  // }
  const user = await Doctor.find({ isActive: true });
  res.status(200).send({
    status: "Success",
    user,
  });
  // if (cache.has("doctors")) {
  //   res.status(200).send(JSON.parse(cache.get("doctors")));
  //   console.log("Doctors", JSON.parse(cache.get("doctors")));
  // } else {
  //   const user = await Doctor.find({ isActive: true });
  //   cache.set("doctors", JSON.stringify(user));
  //   res.status(200).send({
  //     status: "Success",
  //     user,
  //   });
  // }
});

exports.doctorFeedback = catchAsync(async (req, res, next) => {
  const user = await Feedback.find({ doctor: req.uid });

  if (!user) {
    return next(new AppError("User not found", 401));
  }
  res.status(200).send({
    status: "Success",
    user,
  });
});
exports.doctor = catchAsync(async (req, res, next) => {
  const token = req.body.did;
  const doctor = await Doctor.findById(token).populate({
    path: "hospital",
    model: "Provider",
    select: { id: 1, ProviderName: 1, city: 1 },
  });
  res.status(200).send({
    status: "Success",
    doctor,
  });
});

exports.doctorByAuth = catchAsync(async (req, res, next) => {
  const doctor = await Doctor.findById(req.uid).populate({
    path: "hospital",
    model: "Provider",
    select: { id: 1, ProviderName: 1, city: 1 },
  });
  res.status(200).send({
    status: "Success",
    doctor,
  });
});

exports.doctorProfile = catchAsync(async (req, res, next) => {
  let doctorId = await Doctor.findByIdAndUpdate(
    req.uid,
    {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      introduction: req.body.introduction,
      practiceStarted: req.body.practiceStarted,
      hospital: req.body.hospital,
      fees: req.body.fees,
      isActive: req.body.isActive,
      $set: {
        education: [...req?.body?.education],
        specialists: [...req?.body?.specialists],
      },
    },
    {
      new: true,
    }
  );
  res.status(200).json({
    status: "Success",
    doctorId,
  });
});

exports.createPrescription = catchAsync(async (req, res, next) => {
  const token = req.headers["d-access-token"];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (!decoded.id) {
    return new AppError("Please Provide Provider details", 400);
  }
  let doctorId = await Doctor.findByIdAndUpdate(decoded.id);

  const newPrescription = await Prescription.create({
    doctor: doctorId,
    name: req.body.name,
  });

  res.status(200).json({
    newPrescription,
  });
});

exports.createPrescriptionDetail = catchAsync(async (req, res, next) => {
  const token = req.headers["d-access-token"];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (!decoded.id) {
    return new AppError("Please Provide Provider details", 400);
  }
  let doctorId = await Doctor.findByIdAndUpdate(decoded.id);

  const newPrescriptionDetail = await PrescriptionDetail.create({
    PrescriptionName: req.body.psid,
    Sno: req.body.Sno,
    note: req.body.note,
    time: req.body.time,
  });
  console.log(newPrescriptionDetail);
  var d = new Date();
  console.log(`${d.getHours()}:${d.getMinutes()}`);
});

// exports.EmailSendOtp = catchAsync(async (req, res, next) => {
//   console.log(req.body.email);
// });
exports.EmailSendOtp = AuthFactory.sendEmailUpdateOtp(Doctor);
exports.EmailVerifyOtp = AuthFactory.EmailUpdateVerify(Doctor);

exports.MobileSendOtp = AuthFactory.sendMobileOtp(Doctor);
exports.MobileVerifyOtp = AuthFactory.updateMobileNo(Doctor);

exports.createDoctor = AuthFactory.signup(Doctor);
exports.login = AuthFactory.login(Doctor);

exports.updateImage = Image.updateImage(Doctor, "doctor");
exports.removeImage = Image.removeImage(Doctor, "doctor");

exports.forgetPassword = AuthFactory.forgotPassword();
exports.resetPassword = AuthFactory.resetPassword(Doctor);
exports.updateMyPassword = AuthFactory.updatePassword(Doctor);
