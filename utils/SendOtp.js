var axios = require("axios");
var req = axios.create({
  headers: {
    authorization: process.env.authorization,
  },
});

exports.SendOtp = async function SendOtp(phoneNo, otp) {
  let res = await req.post("https://www.fast2sms.com/dev/bulkV2", {
    variables_values: otp,
    route: "otp",
    numbers: phoneNo,
  });
  return res.data;
};

exports.newUser = async function (phoneNo, password) {
  let res = await req.post("https://www.fast2sms.com/dev/bulkV2", {
    sender_id: "TXTIND",
    message: `Username-${phoneNo},Password-${password} at Medico`,
    route: "v3",
    numbers: phoneNo,
  });
  return res.data;
};

exports.AccountCreateSuccessful = async function (phoneNo) {
  let res = await req.post("https://www.fast2sms.com/dev/bulkV2", {
    sender_id: "TXTIND",
    message: `Account Created Successfully - Medico`,
    route: "v3",
    numbers: phoneNo,
  });
  return res.data;
};

exports.NewAppointment = async function (phoneNo, AppointmentId) {
  let res = await req.post("https://www.fast2sms.com/dev/bulkV2", {
    sender_id: "TXTIND",
    message: `Appointment Created Successfully - Medico`,
    route: "v3",
    numbers: phoneNo,
  });
  return res.data;
};

exports.downloadPrescription = async function (phoneNo, AppointmentId) {
  let res = await req.post("https://www.fast2sms.com/dev/bulkV2", {
    sender_id: "TXTIND",
    message: `Download Prescription medico.ink/download?appointment=${AppointmentId}`,
    route: "v3",
    numbers: phoneNo,
  });
  return res.data;
};

exports.Feedback = async function (phoneNo, AppointmentId, doctorToken) {
  let res = await req.post("https://www.fast2sms.com/dev/bulkV2", {
    sender_id: "TXTIND",
    message: `Please Leave Feedback medico.ink/feedback?appointment=${AppointmentId}&doctor=${doctorToken}`,
    route: "v3",
    numbers: phoneNo,
  });
  return res.data;
};

exports.NextAppointment = async function (phoneNo, AppointmentId) {
  let res = await req.post("https://www.fast2sms.com/dev/bulkV2", {
    sender_id: "TXTIND",
    message: `Your Upcoming Appointment medico.ink/appointment/${AppointmentId}`,
    route: "v3",
    numbers: phoneNo,
  });
  return res.data;
};

exports.Balance = async function () {
  let res = await req.post("https://www.fast2sms.com/dev/wallet");
  console.log(res.data);
};
