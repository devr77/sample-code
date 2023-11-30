const express = require("express");
const Appointment = require("../controllers/appointmentController");
const MiddleWare = require("../utils/LoginMiddleware");
const router = express.Router();

router.get("/appointments", Appointment.appointments);
router.post("/appointment-by-id", Appointment.appointmentById);
router.post("/appointment-provider", Appointment.providerAppointment);
router.post("/appointment-doctors", Appointment.doctorAppointment);
router.post("/appointment", Appointment.createAppointment);
router.post(
  "/createAppointment-Provider",
  Appointment.ProviderCreateAppointment
);
router.post("/billing", Appointment.billing);
router.get("/billings", Appointment.billings);
router.post("/appointment-user", Appointment.userAppointment);

router.post("/upload-report", MiddleWare.UserLogin, Appointment.uploadReport);
router.post(
  "/upload-prescription",
  MiddleWare.DoctorLogin,
  Appointment.uploadPrescription
);

router.get(
  "/appointment-by-date",
  MiddleWare.DoctorLogin,
  Appointment.appointmentByDate
);
router.get(
  "/total-sales-today",
  MiddleWare.DoctorLogin,
  Appointment.totalSalesToday
);

router.post("/update-appointment", Appointment.updateAppointment);
router.get("/prescription", Appointment.prescription);
router.get(
  "/doctor-prescription",
  MiddleWare.DoctorLogin,
  Appointment.doctorPrescription
);
router.get("/gen-prescription/:aid", Appointment.GeneratePrescription);
router.get("/prescription/:aid", Appointment.DownloadPrescription);

module.exports = router;
