const cron = require("node-cron");
const Appointment = require("../models/appointmentModel");
const moment = require("moment");

let NotificationModel = [];

function SendCronNotification() {
  //   cron.schedule("*/2 * * * * *", function () {
  //     console.log("---------------------");
  //     console.log("running a task every 2 seconds");
  //   });
}

// 1.Tomorrow Next Appointment run by 2:15PM
const NextAppointmentReminderTomorrow = async () => {
  // cron.schedule("14 15 * * *", function () {
  //   console.log("---------------------");
  //   console.log("running a task every 17 22seconds");
  // });
  const date = new Date().toJSON().slice(0, 10);
  const TomorrowDate = moment(date).add(1, "d");
  const fTomorrowDate = TomorrowDate.format("YYYY-MM-DD");

  let total = await Appointment.find({
    prescriptionNextDate: {
      $gte: `${fTomorrowDate}T00:00:00+05:30`,
      $lte: `${fTomorrowDate}T23:59:59+05:30`,
    },
  }).count();

  console.log("Tomorrow", total);
  // NotificationModel.push(...total);
  // NotificationModel.map((n) => console.log(n.prescriptionTime));
};

// 2.Today Next Appointment run by 7:15AM
const NextAppointmentReminderToday = async () => {
  // cron.schedule("15 7 * * *", function () {
  //   console.log("---------------------");
  //   console.log("running a task every 3 seconds");
  // });
  const date = new Date().toJSON().slice(0, 10);
  const fTomorrowDate = moment(date).format("YYYY-MM-DD");
  let total = await Appointment.find({
    prescriptionNextDate: {
      $gte: `${fTomorrowDate}T00:00:00+05:30`,
      $lte: `${fTomorrowDate}T23:59:59+05:30`,
    },
  }).count();

  console.log("Today", total);
};

function combinedNotification() {
  SendCronNotification();
  NextAppointmentReminderTomorrow();
  NextAppointmentReminderToday();
}

module.exports = combinedNotification;
