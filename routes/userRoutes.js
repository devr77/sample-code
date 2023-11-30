const express = require("express");
const user = require("../controllers/userController");
const message = require("../controllers/messageController");
const MiddleWare = require("../utils/LoginMiddleware");

const router = express.Router();

router.post("/signup", user.createUser);
router.post("/login", user.login);
router.post("/signIn", user.cookeLogin);
router.get("/verify-cookie", user.verifyCookieLogin);

router.post("/verify-email", user.SendVerifyEmail);
router.post("/update-VerifiedEmail", user.UpdateVerifiedEmail);
router.post("/sendOtp", MiddleWare.UserLogin, user.sendOtp);
router.post("/mobileNoUpdate", MiddleWare.UserLogin, user.updateMobileNo);
router.post("/remove-image", MiddleWare.UserLogin, user.removeImage);
router.post("/update-image", MiddleWare.UserLogin, user.updateImage);

router.post("/email-update", MiddleWare.UserLogin, user.updateEmail);
router.post(
  "/email-update-verify",
  MiddleWare.UserLogin,
  user.emailUpdateVerify
);

router.post("/firebase-token", MiddleWare.UserLogin, user.firebaseToken);
router.post(
  "/firebase-notification",
  MiddleWare.UserLogin,
  user.firebaseNotification
);

router.get("/users", user.getAllUser);
router.get("/user", MiddleWare.UserLogin, user.user);
router.post("/user", MiddleWare.UserLogin, user.updateUser);
router.post("/feedback", MiddleWare.UserLogin, user.feedback);
router.post("/user-feedback", MiddleWare.UserLogin, user.userFeedback);

router.post("/forgetPassword", user.forgotPassword);
router.patch("/resetPassword/:token", user.resetPassword);
router.patch("/updateMyPassword", MiddleWare.UserLogin, user.updateMyPassword);
router.post("/forgetPassword-sendOtpNo", user.ForgetPasswordSendMobileOtp);
router.post("/forgetPassword-verifyOtpNo", user.ForgetPasswordVerifyMobileOtp);
router.patch("/resetPassword-mobileNo", user.ResetPasswordMobileNo);

router.get("/messages", MiddleWare.UserLogin, message.messages);
router.post("/message", MiddleWare.UserLogin, message.message);
router.get("/chat-list", MiddleWare.UserLogin, user.getChatList);

// router.use(authController.protect);

// router.use(authController.restrictTo('admin'));

module.exports = router;
