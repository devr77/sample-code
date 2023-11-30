const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Doctor = require("../models/doctorsModel");
const Provider = require("./../models/providerModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const Email = require("../utils/SendEmail");
const Sms = require("../utils/SendOtp");

const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
const EmailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = async (user, statusCode, req, res) => {
  const token = signToken(user.id);
  // Remove password from output
  user.password = undefined;

  const expireTime = await jwt.decode(token);
  const iat = expireTime.iat;
  const exp = expireTime.exp;

  res.cookie("token", token, {
    path: "/",
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
  });

  res.status(statusCode).json({
    status: "success",
    token,
    iat,
    exp,
    user,
  });
};

exports.cookieLogin = () =>
  catchAsync(async (req, res, next) => {
    const Id = req.body.email;
    const password = req.body.password;
    const authToken = jwt.sign({ Id, password }, process.env.JWT_SECRET);
    // console.log("1", req.cookies, req.headers.cookie);
    res.cookie("token", token, {
      path: "/",
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    res.status(200).json({
      status: "success",
      authToken,
    });
  });

// Test Purpose
exports.VerifyCookieLogin = () =>
  catchAsync(async (req, res, next) => {
    res.cookie("token", "token", {
      path: "/",
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    res.status(200).json({
      status: "success",
    });
  });

exports.signup = (Model) =>
  catchAsync(async (req, res, next) => {
    const medium = req.body.medium;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    //1.Check If Body Exists
    if (!medium) {
      return next(new AppError("Please provide email or Mobile No", 400));
    }

    //2. Check If Phone No Valid
    if (phoneRegex.test(medium)) {
      try {
        const newUser = await Model.create({
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          mobileNo: medium,
          password: hashedPassword,
          DoPasswordExists: true,
        });

        createSendToken(newUser, 201, req, res);
      } catch (e) {
        if (e.name === "MongoServerError" && e.code === 11000) {
          res.status(409).json({
            status: "success",
            msg: "User Already registered",
          });
        }
      }
    }

    //3. Check if Email Valid
    if (EmailRegex.test(medium)) {
      try {
        const newUser = await Model.create({
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: medium,
          password: hashedPassword,
          DoPasswordExists: true,
        });

        createSendToken(newUser, 201, req, res);
      } catch (e) {
        if (e.name === "MongoServerError" && e.code === 11000) {
          res.status(409).json({
            status: "success",
            msg: "User Already registered",
          });
        }
      }
    }

    // 4. If Email And Phone Doesn't Exits
    if (!phoneRegex.test(medium) && !EmailRegex.test(medium)) {
      res.status(409).json({
        msg: "Enter Valid Email or Phone no",
      });
    }
  });

exports.login = (Model) =>
  catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    // 1) Check if email and password exist
    if (!email || !password) {
      return next(new AppError("Please provide email and password!", 400));
    }
    // 2) Check if user exists && password is correct
    try {
      const user = await Model.findOne({
        $or: [
          {
            email: email,
          },
          {
            mobileNo: email,
          },
        ],
      }).select("+password");

      if (!user || !(await user.correctPassword(password, user.password))) {
        return res.status(401).send({
          status: "Success",
          message: "Invalid UserId or Password",
        });
      }
      // 3) If everything ok, send token to client
      createSendToken(user, 200, req, res);
    } catch (e) {
      console.log(e);
    }
  });

exports.sendMobileOtp = (MainModel) =>
  catchAsync(async (req, res, next) => {
    const MobileNo = req.body.mobileNo;
    let Model;
    let UserDetail;

    // Check Email Id already Exists
    const user = await User.findOne({ mobileNo: MobileNo });
    if (user !== null) {
      Model = User;
      UserDetail = user;
    }
    const doctor = await Doctor.findOne({ mobileNo: MobileNo });
    if (doctor !== null) {
      Model = Doctor;
      UserDetail = doctor;
    }

    const provider = await Provider.findOne({ mobileNo: MobileNo });
    if (provider !== null) {
      Model = Provider;
      UserDetail = provider;
    }

    // If User doesn't Exists Verify Mobile No
    if (Model === undefined && UserDetail === undefined) {
      // Generating Random Number and Current Time
      const otp = Math.floor(Math.random() * (9999 - 1111) + 1111);
      const expiretime = Date.now() + 15 * 60 * 1000;

      const user = await MainModel.findById(req.uid);

      if (!user) {
        return next(new AppError("User not found", 401));
      }

      user.mobileNoToken.push({
        mobileToken: otp,
        mobileTokenExpire: expiretime,
        mobileNo: MobileNo,
      });
      user.save();

      //Send Otp
      // Sms.SendOtp(MobileNo, otp);
      console.log(MobileNo, otp, expiretime);

      res.status(200).json({
        status: "success",
        data: {
          data: user,
        },
      });
    } else {
      res.status(401).send({
        status: "Success",
        message: "Mobile No Already Exists",
      });
    }
  });

exports.updateMobileNo = (Model) =>
  catchAsync(async (req, res, next) => {
    const user = await Model.findById(req.uid, {
      mobileNoToken: {
        $elemMatch: { mobileToken: { $eq: req.body.otp } },
      },
    });
    if (!user) {
      return new AppError("Please Provide Otp details", 400);
    }
    if (user?.mobileNoToken[0]?.mobileTokenExpire > Date.now()) {
      // DELETE TOEKN
      let finalUser = await Model.findByIdAndUpdate(
        req.uid,
        {
          mobileNo: user.mobileNoToken[0].mobileNo,
          isMobileVerified: true,
          mobileNoToken: {
            $pull: { $elemMatch: { mobileToken: { $eq: req.body.otp } } },
          },
        },
        { new: true }
      );

      res.status(200).json({
        status: "success",
        finalUser,
      });
    } else {
      // Token Expires
      res.status(400).send({
        status: "Failed Token",
        message: "Token Expired",
      });
    }
  });

// Account Verification Use
exports.SendVerifyEmail = (Model) =>
  catchAsync(async (req, res, next) => {
    const email = req.body.email;

    //1.Check if User Exist
    if (!email) {
      return next(new AppError("Please provide email and password!", 400));
    }

    const user = await Model.find({ email: email });
    if (user.length === 0) {
      return next(new AppError("User is Not  Registered", 401));
    }

    // 2.Generate the random reset token

    const resetToken = crypto.randomBytes(32).toString("hex");
    const passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const expireTime = Date.now() + 15 * 60 * 1000;

    const updatedUser = await Model.findByIdAndUpdate(user.id, {
      passwordResetToken: passwordResetToken,
      passwordResetExpires: expireTime,
    });

    // 3) Send it to user's email
    try {
      const resetURL = `${process.env.DOMAIN_URL}verify-email/${user.email}/${passwordResetToken}`;
      Email.sendEmailVerify(user.firstName, user.email, resetURL);

      res.status(200).json({
        status: "success",
        message: "Token sent to email!",
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return next(
        new AppError("There was an error sending the email. Try again later!"),
        500
      );
    }
  });

// Account Verification Use
exports.UpdateVerifiedEmail = (Model) =>
  catchAsync(async (req, res, next) => {
    // 1.Get User based on Token
    let token = req.body.token;
    let emailId = req.body.email;

    const user = await Model.findOne({
      email: emailId,
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });

    // 2) If token has not expired, and there is user, set the new password

    if (!user) {
      res.status(409).json({
        status: "Token is Invalid or Expired",
      });
    }
    if (user) {
      user.isEmailVerified = true;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
      res.status(200).json({
        status: "success",
        user,
      });
    }
  });

// Forget Password Email
exports.forgotPassword = () =>
  catchAsync(async (req, res, next) => {
    // 1) Get user based on Posted email
    const email = req.body.email;
    let Model;
    let UserDetail;

    const user = await User.findOne({
      email: email,
    });
    if (user !== null) {
      Model = User;
      UserDetail = user;
    }
    const doctor = await Doctor.findOne({
      email: email,
    });
    if (doctor !== null) {
      Model = Doctor;
      UserDetail = doctor;
    }

    const provider = await Provider.findOne({
      email: email,
    });
    if (provider !== null) {
      Model = Provider;
      UserDetail = provider;
    }

    if (Model === undefined && UserDetail === undefined) {
      res.status(409).json({
        status: "success",
        message: "User Doesn't Exits",
      });
    }

    // 2) Generate the random reset token

    const resetToken = crypto.randomBytes(32).toString("hex");
    const passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const expiretime = Date.now() + 15 * 60 * 1000;

    let updateuser = await Model.findByIdAndUpdate(UserDetail?.id, {
      passwordResetToken: passwordResetToken,
      passwordResetExpires: expiretime,
    });

    // 3) Send it to user's email or Phone No

    try {
      const resetURL = `${process.env.DOMAIN_URL}updatePassword/${passwordResetToken}?email=${email}`;
      Email.sendPasswordReset(UserDetail.firstName, UserDetail.email, resetURL);

      res.status(200).json({
        status: "success",
        message: "Token sent to email!",
      });
    } catch (err) {
      updateuser.passwordResetToken = undefined;
      updateuser.passwordResetExpires = undefined;
      await updateuser.save({ validateBeforeSave: false });

      return next(
        new AppError("There was an error sending the email. Try again later!"),
        500
      );
    }
  });

// Forget Password Mobile Send Otp
exports.forgotPasswordSendMobileOtp = () =>
  catchAsync(async (req, res, next) => {
    const mobileNo = req.body.mobileNo;
    // 1) Get user based on Posted email
    let Model;
    let UserDetail;

    const user = await User.findOne({ mobileNo: mobileNo });
    if (user !== null) {
      Model = User;
      UserDetail = user;
    }

    const doctor = await Doctor.findOne({ mobileNo: mobileNo });
    if (doctor !== null) {
      Model = Doctor;
      UserDetail = doctor;
    }

    const provider = await Provider.findOne({ mobileNo: mobileNo });
    if (provider !== null) {
      Model = Provider;
      UserDetail = provider;
    }

    // Check If User Exists
    if (Model === undefined && UserDetail === undefined) {
      res.status(409).json({
        status: "success",
        message: "User Doesn't Exits",
      });
    } else {
      // 2) Generate the random reset token

      const otp = Math.floor(Math.random() * (9999 - 1111) + 1111);
      const expiration = Date.now() + 15 * 60 * 1000;

      let updateuser = await Model.findByIdAndUpdate(UserDetail?.id, {
        passwordResetToken: otp,
        passwordResetExpires: expiration,
      });

      // 3) Send Otp to Phone No

      try {
        console.log(mobileNo, otp, expiration);
        res.status(200).json({
          status: "success",
          message: "Otp Sent to Phone no",
        });
      } catch (err) {
        updateuser.passwordResetToken = undefined;
        updateuser.passwordResetExpires = undefined;
        await updateuser.save({ validateBeforeSave: false });

        return next(
          new AppError(
            "There was an error sending the email. Try again later!"
          ),
          500
        );
      }
    }
  });

// Forget Password Mobile Verify Otp
exports.forgotPasswordVerifyMobileOtp = (Model) =>
  catchAsync(async (req, res, next) => {
    const mobileNo = req.body.mobileNo;
    const token = req.body.otp;
    const expiretime = Date.now() + 15 * 60 * 1000;
    // 1) Get user based on Posted email
    let Model;
    let UserDetail;

    const user = await User.findOne({ mobileNo: mobileNo });
    if (user !== null) {
      Model = User;
      UserDetail = user;
    }

    const doctor = await Doctor.findOne({ mobileNo: mobileNo });
    if (doctor !== null) {
      Model = Doctor;
      UserDetail = doctor;
    }

    const provider = await Provider.findOne({ mobileNo: mobileNo });
    if (provider !== null) {
      Model = Provider;
      UserDetail = provider;
    }

    if (Model === undefined && UserDetail === undefined) {
      res.status(409).json({
        status: "success",
        message: "User Doesn't Exits",
      });
    }

    // 2) If token has not expired, and there is user, set the new password
    if (UserDetail.passwordResetToken !== token) {
      res.status(400).json({
        messages: "Enter Valid Token",
      });
    }

    if (expiretime > UserDetail.passwordResetExpires) {
      UserDetail.passwordResetExpires = undefined;
      await UserDetail.save();
      res.status(401).json({
        messages: "Token Expired",
      });
    }

    if (
      UserDetail.passwordResetToken === token &&
      expiretime < UserDetail.passwordResetExpires
    ) {
      UserDetail.passwordResetToken = undefined;
      UserDetail.passwordResetExpires = undefined;

      await UserDetail.save();
      res.status(200).json({
        messages: "Otp Verified",
      });
    }
  });

// Update Password Using MObile No
exports.UpdatePasswordMobileNo = (Model) =>
  catchAsync(async (req, res, next) => {
    const mobileNo = req.body.mobileNo;
    const password = req.body.password;
    // 1) Get user based on Posted email
    let Model;
    let UserDetail;

    const user = await User.findOne({ mobileNo: mobileNo });
    if (user !== null) {
      Model = User;
      UserDetail = user;
    }

    const doctor = await Doctor.findOne({ mobileNo: mobileNo });
    if (doctor !== null) {
      Model = Doctor;
      UserDetail = doctor;
    }

    const provider = await Provider.findOne({ mobileNo: mobileNo });
    if (provider !== null) {
      Model = Provider;
      UserDetail = provider;
    }

    if (Model === undefined && UserDetail === undefined) {
      res.status(409).json({
        status: "success",
        message: "User Doesn't Exits",
      });
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const user = await Model.findOne({ mobileNo: mobileNo });
      user.password = hashedPassword;
      await user.save();
      res.status(200).json({
        messages: "Password Updated",
      });
    }
  });

// Email Update For Account
exports.EmailUpdateVerify = (Model) =>
  catchAsync(async (req, res, next) => {
    const user = await Model.findById(req.uid, {
      emailIdToken: {
        $elemMatch: { emailToken: { $eq: req.body.otp } },
      },
    });

    if (!user) {
      return new AppError("Please Provide Otp details", 400);
    }
    if (user?.emailIdToken[0]?.emailTokenExpire > Date.now()) {
      let finalUser = await Model.findByIdAndUpdate(
        req.uid,
        {
          email: user.emailIdToken[0].email,
          emailIdToken: {
            $pull: { $elemMatch: { emailToken: { $eq: req.body.otp } } },
          },
        },
        { new: true }
      );

      res.status(200).json({
        status: "success",
        finalUser,
      });
    } else {
      // Token Expires
      res.status(400).send({
        status: "Failed Token",
        message: "Token Expired",
      });
    }
  });

// Reset Password Through Email Update
exports.resetPassword = () =>
  catchAsync(async (req, res, next) => {
    let token = req.params.token;
    let email = req.query.email;
    const expireTime = Date.now();

    let Model;
    let UserDetail;

    // 1)Find User Detail
    const user = await User.findOne({ email: email });
    if (user !== null) {
      Model = User;
      UserDetail = user;
    }
    const doctor = await Doctor.findOne({ email: email });
    if (doctor !== null) {
      Model = Doctor;
      UserDetail = doctor;
    }

    const provider = await Provider.findOne({ email: email });
    if (provider !== null) {
      Model = Provider;
      UserDetail = provider;
    }

    // 2) If token has not expired, and there is user, set the new password
    if (UserDetail.passwordResetToken !== token) {
      res.status(400).json({
        messages: "Enter Valid Token",
      });
    }

    if (expireTime > UserDetail.passwordResetExpires) {
      UserDetail.passwordResetExpires = undefined;
      await UserDetail.save();
      res.status(401).json({
        messages: "Token Expired",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    if (
      UserDetail.passwordResetToken === token &&
      expireTime < UserDetail.passwordResetExpires
    ) {
      UserDetail.passwordResetToken = undefined;
      UserDetail.passwordResetExpires = undefined;
      UserDetail.password = hashedPassword;
      await UserDetail.save();
      res.status(200).json({
        messages: "Password Updated",
      });
    }
  });

exports.updatePassword = (Model) =>
  catchAsync(async (req, res, next) => {
    let id = req.uid;
    // 1) Get user from collection
    const user = await Model.findById(id).select("+password");

    // 2) Check if POSTed current password is correct
    if (
      !(await user.correctPassword(req.body.CurrentPassword, user.password))
    ) {
      res.status(401).json({
        status: "Your current password is wrong.",
      });
    } else {
      // 3) If so, update password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.newPassword, salt);
      user.password = await hashedPassword;

      await user.save();
      // User.findByIdAndUpdate will NOT work as intended!

      res.status(200).json({
        status: "success",
        user,
      });
    }
  });

// Email Update For Account
exports.sendEmailUpdateOtp = (ExistModel) =>
  catchAsync(async (req, res, next) => {
    const email = req.body.email;

    let Model;
    let UserDetail;

    // Check Email Id already Exists
    const user = await User.findOne({ email: email });
    if (user !== null) {
      Model = User;
      UserDetail = user;
    }
    const doctor = await Doctor.findOne({ email: email });
    if (doctor !== null) {
      Model = Doctor;
      UserDetail = doctor;
    }

    const provider = await Provider.findOne({ email: email });
    if (provider !== null) {
      Model = Provider;
      UserDetail = provider;
    }

    // If User doesn't Exists Verify Email
    if (Model === undefined && UserDetail === undefined) {
      const user = await ExistModel.findById(req.uid);
      if (!user) {
        return next(new AppError("User not found", 401));
      }

      // Generating Random Number and Current Time
      const otp = Math.floor(Math.random() * (9999 - 1111) + 1111);
      const expiration = Date.now() + 15 * 60 * 1000;

      user.emailIdToken.push({
        emailToken: otp,
        emailTokenExpire: expiration,
        email: email,
      });
      user.save();

      // Send Otp to Email
      console.log(email, otp, expiration);

      //logic that sends an OTP (One-Time Password) to the verified email

      res.status(200).json({
        status: "success",
        user,
      });
    } else {
      res.status(401).send({
        status: "Success",
        message: "Email Already Exists",
      });
    }
  });

// Email Update For Account
exports.EmailUpdateVerify = (Model) =>
  catchAsync(async (req, res, next) => {
    const user = await Model.findById(req.uid, {
      emailIdToken: {
        $elemMatch: { emailToken: { $eq: req.body.otp } },
      },
    });

    if (!user) {
      return new AppError("Please Provide Otp details", 400);
    }
    if (user?.emailIdToken[0]?.emailTokenExpire > Date.now()) {
      let finalUser = await Model.findByIdAndUpdate(
        req.uid,
        {
          email: user.emailIdToken[0].email,
          emailIdToken: {
            $pull: { $elemMatch: { emailToken: { $eq: req.body.otp } } },
          },
        },
        { new: true }
      );

      res.status(200).json({
        status: "success",
        finalUser,
      });
    } else {
      // Token Expires
      res.status(400).send({
        status: "Failed Token",
        message: "Token Expired",
      });
    }
  });

exports.logout = (req, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: "success" });
};

exports.protect = (Model) =>
  catchAsync(async (req, res, next) => {
    // 1) Getting token and check of it's there
    let token;
    if (
      req.headers.authorization ||
      req.headers.authorization.startsWith("Bearer") ||
      req.headers["x-access-token"]
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return next(
        new AppError("You are not logged in! Please log in to get access.", 401)
      );
    }

    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const currentUser = await Model.findById(decoded.id);
    if (!currentUser) {
      return next(
        new AppError(
          "The user belonging to this token does no longer exist.",
          401
        )
      );
    }

    // 4) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError(
          "User recently changed password! Please log in again.",
          401
        )
      );
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
  });

// Only for rendered pages, no errors!
exports.isLoggedIn = (Model) => async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2) Check if user still exists
      const currentUser = await Model.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'lead-guide']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }

    next();
  };
};
