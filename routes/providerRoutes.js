const express = require("express");
const Provider = require("../controllers/providerController");
const MiddleWare = require("../utils/LoginMiddleware");

const router = express.Router();

router.post("/signup", Provider.createProvider);
router.post("/login", Provider.login);
router.post("/update-image", MiddleWare.ProviderLogin, Provider.updateImage);

router.post("/sendOtp", MiddleWare.ProviderLogin, Provider.sendMobileOtp);
router.post("/verifyOtp", MiddleWare.ProviderLogin, Provider.verifyOtp);

router.post("/email-sendOtp", MiddleWare.ProviderLogin, Provider.EmailSendOtp);
router.post(
  "/email-verifyOtp",
  MiddleWare.ProviderLogin,
  Provider.EmailVerifyOtp
);

router.post(
  "/mobile-sendOtp",
  MiddleWare.ProviderLogin,
  Provider.MobileSendOtp
);
router.post(
  "/mobile-verifyOtp",
  MiddleWare.ProviderLogin,
  Provider.MobileVerifyOtp
);
router.get("/providers", Provider.providers);
router.post("/provider", MiddleWare.ProviderLogin, Provider.provider);
router.post("/provider-byId", Provider.providerById);
router.post("/provider-page", MiddleWare.ProviderLogin, Provider.providerPage);
router.post("/provider-doctor", Provider.providerDoctor);

router.post("/forgetPassword", Provider.forgotPassword);
router.patch("/resetPassword/:token", Provider.resetPassword);
router.patch(
  "/updateMyPassword",
  MiddleWare.ProviderLogin,
  Provider.updateMyPassword
);

module.exports = router;
