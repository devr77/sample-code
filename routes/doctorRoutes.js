const express = require("express");
const doctorController = require("../controllers/doctorsController");
const MiddleWare = require("../utils/LoginMiddleware");

const router = express.Router();

router.get("/doctors", doctorController.doctors);
router.post("/doctor", doctorController.doctor);

router.post("/signUp", doctorController.createDoctor);
router.post("/login", doctorController.login);

router.post(
  "/remove-image",
  MiddleWare.DoctorLogin,
  doctorController.removeImage
);
router.post(
  "/update-image",
  MiddleWare.DoctorLogin,
  doctorController.updateImage
);
router.post(
  "/doctor-detail",
  MiddleWare.DoctorLogin,
  doctorController.doctorByAuth
);
router.post(
  "/doctor-profile",
  MiddleWare.DoctorLogin,
  doctorController.doctorProfile
);

router.post(
  "/email-sendOtp",
  MiddleWare.DoctorLogin,
  doctorController.EmailSendOtp
);
router.post(
  "/email-verifyOtp",
  MiddleWare.DoctorLogin,
  doctorController.EmailVerifyOtp
);

router.post(
  "/mobile-sendOtp",
  MiddleWare.DoctorLogin,
  doctorController.MobileSendOtp
);
router.post(
  "/mobile-verifyOtp",
  MiddleWare.DoctorLogin,
  doctorController.MobileVerifyOtp
);

router.post("/create-prescription", doctorController.createPrescription);
router.post(
  "/create-prescription-detail",
  doctorController.createPrescriptionDetail
);

router.post(
  "/doctor-feedback",
  MiddleWare.DoctorLogin,
  doctorController.doctorFeedback
);

router.post("/forgetPassword", doctorController.forgetPassword);
router.patch("/resetPassword/:token", doctorController.resetPassword);
router.patch(
  "/update-password",
  MiddleWare.DoctorLogin,
  doctorController.updateMyPassword
);

module.exports = router;
