const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/userModel");
const Verification = require("../models/verificationModel");
const Sms = require("../utils/SendOtp");
const Email = require("../utils/SendEmail");

const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
const EmailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

exports.SendVerifyToken = catchAsync(async (req, res, next) => {
  const medium = req.body.medium;

  //1.Check If Body Exists
  if (!medium) {
    return next(new AppError("Please provide email or Mobile No", 400));
  }

  //2.Check if Phone No Exists
  if (phoneRegex.test(medium)) {
    //a.Check if User Exist
    const user = await User.count({ mobileNo: medium });
    if (user > 0) {
      res.status(403).json({
        messages: "User Already Exists",
      });
    } else {
      // b.Generate the random reset token
      const otp = Math.floor(Math.random() * (9999 - 1111) + 1111);
      const expireTime = Date.now() + 15 * 60 * 1000;
      // c.Check If Previous token Exits
      const count = await Verification.count({ mobileNo: medium });

      if (count > 0) {
        const UpdatedVerification = await Verification.findOneAndUpdate(
          { mobileNo: medium },
          {
            passwordResetToken: otp,
            passwordResetExpires: expireTime,
          },
          {
            new: true,
          }
        );
        console.log(
          "UpdatedVerification",
          medium,
          UpdatedVerification,
          UpdatedVerification.mobileNo,
          UpdatedVerification.passwordResetToken
        );
        // Send Otp to Mobile No

        res.status(200).json({
          messages: "Otp Sent ",
          medium: medium,
          otp: otp,
        });
      } else {
        const CreateVerification = await Verification.create({
          mobileNo: medium,
          passwordResetToken: otp,
          passwordResetExpires: expireTime,
        });
        console.log("CreateVerification ", CreateVerification, medium, otp);
        // Send Otp to Mobile No

        res.status(200).json({
          messages: "Otp Send",
          medium: medium,
          otp: otp,
        });
      }
    }
  }

  //3.Check if Email Id Exists

  if (EmailRegex.test(medium)) {
    //a.Check if User Exist
    const user = await User.count({ email: medium });
    if (user > 0) {
      res.status(403).json({
        messages: "User Already Exists",
      });
    } else {
      // b.Generate the random reset token
      const otp = Math.floor(Math.random() * (9999 - 1111) + 1111);
      const expireTime = Date.now() + 15 * 60 * 1000;
      // c.Check If Previous token Exits
      const count = await Verification.count({ email: medium });

      if (count > 0) {
        const UpdatedVerification = await Verification.findOneAndUpdate(
          { email: medium },
          {
            passwordResetToken: otp,
            passwordResetExpires: expireTime,
          },
          {
            new: true,
          }
        );
        console.log("UpdatedVerification", medium, otp);

        // Email.sendEmailVerify(newUser.firstName, newUser.email, VerifyURL);

        res.status(200).json({
          medium: medium,
          otp: otp,
        });
      } else {
        const CreateVerification = await Verification.create({
          email: medium,
          passwordResetToken: otp,
          passwordResetExpires: expireTime,
        });
        console.log("CreateVerification ", medium, otp);

        // Email.sendEmailVerify(newUser.firstName, newUser.email, VerifyURL);

        res.status(200).json({
          medium: medium,
          otp: otp,
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

exports.VerifyToken = catchAsync(async (req, res, next) => {
  const medium = req.body.medium;
  const otp = req.body.otp;
  const expireTime = Date.now();

  //1.Check If Body Exists
  if (!medium && !otp) {
    return next(new AppError("Provide email/Mobile With Otp", 400));
  }

  //2.Check if Phone No Exists
  if (phoneRegex.test(medium)) {
    const CheckOtp = await Verification.findOne({
      mobileNo: medium,
    });

    console.log(CheckOtp, CheckOtp.passwordResetToken, otp);

    if (CheckOtp.passwordResetToken !== otp) {
      res.status(400).json({
        messages: "Enter Valid Otp",
        medium: medium,
      });
    }

    if (expireTime > CheckOtp.passwordResetExpires) {
      CheckOtp.passwordResetExpires = undefined;
      await CheckOtp.save();
      res.status(401).json({
        messages: "Token Expired",
        medium: medium,
      });
    }

    if (
      CheckOtp.passwordResetToken === otp &&
      expireTime < CheckOtp.passwordResetExpires
    ) {
      CheckOtp.passwordResetToken = undefined;
      CheckOtp.passwordResetExpires = undefined;
      await CheckOtp.save();
      res.status(200).json({
        messages: "User Verified",
        medium: medium,
      });
    }
  }

  //3.Check if Email Id Exists
  if (EmailRegex.test(medium)) {
    const CheckOtp = await Verification.findOne({
      email: medium,
    });
    console.log(CheckOtp, CheckOtp.passwordResetToken, otp);

    if (CheckOtp.passwordResetToken !== otp) {
      res.status(400).json({
        messages: "Enter Valid Otp",
        medium: medium,
      });
    }

    if (expireTime > CheckOtp.passwordResetExpires) {
      CheckOtp.passwordResetExpires = undefined;
      await CheckOtp.save();
      res.status(401).json({
        messages: "Token Expired",
        medium: medium,
      });
    }

    if (
      CheckOtp.passwordResetToken === otp &&
      expireTime < CheckOtp.passwordResetExpires
    ) {
      CheckOtp.passwordResetToken = undefined;
      CheckOtp.passwordResetExpires = undefined;
      await CheckOtp.save();
      res.status(200).json({
        messages: "User Verified",
        medium: medium,
      });
    }
  }

  // 4. If Email And Phone Doesn't Exits
  if (!phoneRegex.test(medium) && !EmailRegex.test(medium)) {
    res.status(409).json({
      msg: "Enter Valid Email / Phone Otp",
    });
  }
});
