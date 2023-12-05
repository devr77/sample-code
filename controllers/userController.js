const jwt = require("jsonwebtoken");
const moment = require("moment");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const User = require("./../models/userModel");
const Feedback = require("./../models/feedbackModel");
const Message = require("./messageController");
const AuthFactory = require("./authController");
const Firebase = require("../utils/Firebase");
const Image = require("./ImageController");

exports.user = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.uid);
  if (!user) {
    return next(new AppError("User not found", 401));
  }
  res.status(200).send({
    status: "Success",
    user,
  });
});

exports.userFeedback = catchAsync(async (req, res, next) => {
  const feedback = await Feedback.find({ user: req.uid });
  if (!feedback) {
    return next(new AppError("User not found", 401));
  }
  res.status(200).send({
    status: "Success",
    feedback,
  });
});

exports.firebaseToken = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.uid,
    {
      firebaseToken: req.body.token,
    },
    { new: true }
  );
  res.status(200).send({
    status: "Success",
    user,
  });
});

exports.firebaseNotification = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.uid);
  console.log(user.firebaseToken);
  Firebase.sendNotification(user.firebaseToken);
});

exports.getAllUser = catchAsync(async (req, res, next) => {
  const user = await User.find();

  res.status(200).json({
    status: "success",
    user,
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.uid,
    {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      gender: req.body.gender,
      bloodGroup: req.body.bloodGroup,
      height: req.body.height,
      weight: req.body.weight,
      DateOfBirth: req.body.DateOfBirth,
      hAddress: req.body.hAddress,
      locality: req.body.locality,
      city: req.body.city,
      pinCode: req.body.pinCode,
      state: req.body.state,
      isDisabled: req.body.isDisabled,
      image: req.body.image,
      pushToken: req.body.pushToken,
    },
    {
      new: true,
    }
  );

  res.status(200).json({
    status: "success",
    user,
  });
});

exports.feedback = catchAsync(async (req, res, next) => {
  const feedback = await Feedback.create({
    user: req.uid,
    appointment: req.body.appointment,
    doctor: req.body.doctor,
    bookingProcess: req.body.bookingProcess,
    review: req.body.review,
    rating: req.body.rating,
    cleanliness: req.body.cleanliness,
    staffBehavior: req.body.staffBehavior,
    DoctorBehavior: req.body.DoctorBehavior,
    waitingTime: req.body.waitingTime,
    OtherRecommendation: req.body.recommendation,
    websiteSatisfaction: req.body.satisfaction,
    otherFeedback: req.body.otherFeedback,
  });
  res.status(200).json({
    status: "success",
    feedback,
  });
});

exports.createUser = AuthFactory.signup(User);
exports.login = AuthFactory.login(User);
exports.cookeLogin = AuthFactory.cookieLogin();
exports.verifyCookieLogin = AuthFactory.VerifyCookieLogin();

exports.updateImage = Image.updateImage(User, "user");
exports.removeImage = Image.removeImage(User, "user");

exports.sendOtp = AuthFactory.sendMobileOtp(User);
exports.updateMobileNo = AuthFactory.updateMobileNo(User);

exports.SendVerifyEmail = AuthFactory.SendVerifyEmail(User);
exports.UpdateVerifiedEmail = AuthFactory.UpdateVerifiedEmail(User);

exports.updateEmail = AuthFactory.sendEmailUpdateOtp(User);
exports.emailUpdateVerify = AuthFactory.EmailUpdateVerify(User);

exports.forgotPassword = AuthFactory.forgotPassword();
exports.resetPassword = AuthFactory.resetPassword();
exports.updateMyPassword = AuthFactory.updatePassword(User);

exports.ForgetPasswordSendMobileOtp = AuthFactory.forgotPasswordSendMobileOtp();
exports.ForgetPasswordVerifyMobileOtp =
  AuthFactory.forgotPasswordVerifyMobileOtp();

exports.ResetPasswordMobileNo = AuthFactory.UpdatePasswordMobileNo();

exports.createMessage = Message.message;
exports.getMessages = Message.messages;
exports.getChatList = Message.getUserChatsCount;
