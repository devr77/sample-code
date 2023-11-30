const SendWhatsAppMessage = require("./WhatsAppApi");
const MobileNo = require("./SendOtp");
const SendEmail = require("./SendEmail");
const combinedNotification = require("../controllers/NotificationController");
const { pushNotification } = require("./PushNotification");
const { GenerateReport } = require("./GenrateReport");

function MainUtility() {
  // WhatsApp Message
  // SendWhatsAppMessage.SendMessage();
  // SendWhatsAppMessage.AppointmentNotification(8292959023, 8292959023);
  // Balance Check
  //   MobileNo.Balance();
  // Browser Push Notification
  // pushNotification();
  // Daily Notification Target
  // combinedNotification();
  // Report Making
  // GenerateReport({
  //   path: "1234567.pdf",
  //   doctorName: "Dr. Alex Strange",
  //   education: "MBBS",
  //   registrationNo: "72/72A",
  //   specialists: "Physician",
  //   hospitalName: "Appolo Hospital ",
  //   hospitalAddress: "Ludhiana",
  //   contactNo: "1234567890",
  //   patientName: "Robert",
  //   age: "42",
  //   gender: "male",
  //   prescriptionDate: "03/10/2023",
  //   cMobileNo: "9876543210",
  //   cAddress: "Manchester",
  //   problem: "Mild Fevver",
  //   prescriptionNote: "Take Medicine",
  // });
  // Send Email
  // SendEmail.downloadPrescription("satyamkumar123451@gmail.com");
}

module.exports = MainUtility;
