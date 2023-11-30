const Provider = require("./../models/providerModel");
const Doctor = require("../models/doctorsModel");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const AuthFactory = require("./authController");
const jwt = require("jsonwebtoken");
const Sms = require("../utils/SendOtp");
const Image = require("./ImageController");

exports.providerPage = catchAsync(async (req, res, next) => {
  let UpdateBody = Object.assign({}, req.body);
  delete UpdateBody.licenseAndAffiliation;
  let ProviderId = await Provider.findByIdAndUpdate(
    req.uid,
    {
      UpdateBody,
      $set: { licenseAndAffiliation: [...req.body.licenseAndAffiliation] },
    },
    {
      new: true,
    }
  );

  if (!ProviderId) {
    return next(new AppError("Provider not found", 401));
  }

  res.status(200).json({
    status: "Success",
    ProviderId,
  });
});

exports.provider = catchAsync(async (req, res, next) => {
  const provider = await Provider.findById(req.uid);
  if (!provider) {
    return next(new AppError("Provider not found", 401));
  }

  res.status(200).send({
    status: "Success",
    provider: provider,
  });
});

exports.providerById = catchAsync(async (req, res, next) => {
  const provider = await Provider.findById(req.body.id);
  if (!provider) {
    return next(new AppError("Provider not found", 401));
  }

  res.status(200).send({
    status: "Success",
    provider: provider,
  });
});

exports.providers = catchAsync(async (req, res, next) => {
  const providers = await Provider.find().select("_id ProviderName Address");

  res.status(200).json({
    status: "Success",
    providers: providers,
  });
});

exports.providerDoctor = catchAsync(async (req, res, next) => {
  let token;
  const headerToken = req.headers["p-access-token"];
  const bodyToken = req.body.did;

  if (headerToken) {
    try {
      let decoded = jwt.verify(headerToken, process.env.JWT_SECRET);
      token = decoded?.id;
    } catch (err) {
      // if (err.name === "TokenExpiredError") {
      //   res.status(401).json({
      //     status: "Jwt Expired",
      //   });
      // }
    }
  }
  if (bodyToken) {
    token = bodyToken;
  }
  let providerDoctor = await Doctor.find({ hospital: token }).select({
    id: 1,
    slug: 1,
    education: 1,
    specialists: 1,
    firstName: 1,
    lastName: 1,
    image: 1,
    practiceStarted: 1,
    fees: 1,
    hospital: {
      id: 1,
    },
  });
  res.status(200).json({
    status: "Success",
    providerDoctor,
  });
});

// PATIENT VERIFICATION MOBILE NO SEND OTP
exports.sendMobileOtp = catchAsync(async (req, res, next) => {
  const MobileNo = req.body.mobileNo;

  // Generating Random Number and Current Time
  const otp = Math.floor(Math.random() * (9999 - 1111) + 1111);
  const expiretime = Date.now() + 15 * 60 * 1000;

  const mobileNoOtp = await Provider.findById(req.uid);

  if (!mobileNoOtp) {
    return next(new AppError("User not found", 401));
  }

  // Send Otp
  // Sms.SendOtp(MobileNo, otp);
  console.log(MobileNo, otp);

  mobileNoOtp.mobileNoToken.push({
    mobileToken: otp,
    mobileTokenExpire: expiretime,
    mobileNo: MobileNo,
  });
  mobileNoOtp.save();

  res.status(200).json({
    status: "success",
    mobileNoOtp,
  });
});

// PATIENT VERIFICATION MOBILE NO
exports.verifyOtp = catchAsync(async (req, res, next) => {
  const provider = await Provider.findById(req.uid, {
    mobileNoToken: {
      $elemMatch: { mobileToken: { $eq: req.body.otp } },
    },
  });
  if (!provider) {
    return new AppError("Please Provide Otp details", 400);
  }

  if (provider?.mobileNoToken[0]?.mobileTokenExpire > Date.now()) {
    provider.tempMobileNo = provider.mobileNoToken[0].mobileNo;
    provider.save();

    // DELETE TOEKN
    let finalUser = await Provider.findByIdAndUpdate(
      req.uid,
      {
        mobileNoToken: {
          $pull: { $elemMatch: { mobileToken: { $eq: req.body.otp } } },
        },
      },
      { new: true }
    );
    // If User Already Exists Send Previous Data
    let ExistUser = await User.findOne({
      mobileNo: provider.mobileNoToken[0].mobileNo,
    });
    if (ExistUser) {
      res.status(200).json({
        status: "success",
        ExistUser: ExistUser,
        patientMobileNo: provider.mobileNoToken[0].mobileNo,
      });
    } else {
      res.status(200).json({
        status: "success",
        patientMobileNo: provider.mobileNoToken[0].mobileNo,
      });
    }
  } else {
    // Token Expires
    res.status(400).send({
      status: "Failed Token",
      message: "Token Expired",
    });
  }
});

exports.createProvider = AuthFactory.signup(Provider);
exports.login = AuthFactory.login(Provider);

exports.updateImage = Image.updateImage(Provider, "provider");
exports.removeImage = Image.removeImage(Provider, "provider");

exports.forgotPassword = AuthFactory.forgotPassword();
exports.resetPassword = AuthFactory.resetPassword();
exports.updateMyPassword = AuthFactory.updatePassword(Provider);

exports.EmailSendOtp = AuthFactory.sendEmailUpdateOtp(Provider);
exports.EmailVerifyOtp = AuthFactory.EmailUpdateVerify(Provider);

exports.MobileSendOtp = AuthFactory.sendMobileOtp(Provider);
exports.MobileVerifyOtp = AuthFactory.updateMobileNo(Provider);
