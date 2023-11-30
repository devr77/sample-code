const whatsAppClient = require("@green-api/whatsapp-api-client");

const restAPI = whatsAppClient.restAPI({
  idInstance: process.env.GREENAPI_IdInstance,
  apiTokenInstance: process.env.GREENAPI_ApiTokenInstance,
});
exports.SendMessage = async function SendMessage() {
  try {
    const response = await restAPI.message.sendMessage(
      process.env.mobileNo,
      null,
      "Your Appointment Booked Successfully"
    );
  } catch (ex) {
    console.log(ex);
  }
};

exports.AppointmentNotification = async function AppointmentNotification(
  phoneNo,
  AppointmentToken
) {
  try {
    const response = await restAPI.message.sendMessage(
      `91${phoneNo}@c.us`,
      null,
      `Your Appointment Booked Successfully #${AppointmentToken}.You Can Track On medico.ink/appointment/${AppointmentToken}`
    );
    console.log(response);
  } catch (ex) {
    console.log(ex);
  }
};

exports.PrescriptionNotification = async function PrescriptionNotification(
  phoneNo,
  AppointmentToken
) {
  try {
    const response = await restAPI.message.sendMessage(
      `91${phoneNo}@c.us`,
      null,
      `Hope You are following the Prescription And Taking the Medicine Regularly.You Can View Prescription On medico.ink/appointment/${AppointmentToken}`
    );
    console.log(response);
  } catch (ex) {
    console.log(ex);
  }
};

exports.UpcomingAppointmentNotification =
  async function UpcomingAppointmentNotification(
    phoneNo,
    date,
    AppointmentToken
  ) {
    try {
      const response = await restAPI.message.sendMessage(
        `91${phoneNo}@c.us`,
        null,
        `A Gentle Remainder for Upcoming Appointment On ${date}  .You Can Manage Appointment On medico.ink/appointment/${AppointmentToken}`
      );
      console.log(response);
    } catch (ex) {
      console.log(ex);
    }
  };

exports.FeedbackNotification = async function FeedbackNotification(
  phoneNo,
  AppointmentToken,
  doctorToken
) {
  try {
    const response = await restAPI.message.sendMessage(
      `91${phoneNo}@c.us`,
      null,
      `You have Prescribed Successfully #${AppointmentToken} . Please Leave Feedback for Us  On medico.ink/feedback?appointment=${AppointmentToken}&doctor=${doctorToken}`
    );
    console.log(response);
  } catch (ex) {
    console.log(ex);
  }
};
