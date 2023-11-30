const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
var ObjectId = require("mongodb").ObjectID;
const path = require("path");

const Appointment = require("../models/appointmentModel");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const Doctor = require("../models/doctorsModel");
const Billing = require("../models/billingModel");
const Image = require("../controllers/ImageController");

const Sms = require("../utils/SendOtp");
const mongoose = require("mongoose");
const { GenerateReport } = require("../utils/GenrateReport");
var url2pdf = require("url2pdf");

exports.appointmentById = catchAsync(async (req, res, next) => {
  let appointment = await Appointment.findById(req.body.id).populate(
    "doctor user"
  );
  res.status(200).send({
    status: "Success",
    appointment,
  });
});

exports.appointments = catchAsync(async (req, res, next) => {
  let data = await Appointment.find();

  res.status(200).send({
    status: "Success",
    data,
  });
});

exports.userAppointment = catchAsync(async (req, res, next) => {
  const token = req.headers["x-access-token"];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (!decoded.id) {
    return new AppError("Please Provide User details", 400);
  }
  let appointments = await Appointment.find({ user: { $in: decoded.id } }).sort(
    { createdAt: -1 }
  );
  res.status(200).json({
    status: "success",
    appointments,
  });
});

exports.doctorAppointment = catchAsync(async (req, res, next) => {
  const token = req.headers["d-access-token"];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  let total = await Appointment.find({ DoctorId: { $in: decoded.id } }).count();
  let appointment = await Appointment.find({
    DoctorId: { $in: decoded.id },
  }).sort({ createdAt: -1 });
  res.status(200).json({
    status: "success",
    total: total,
    appointment,
  });
});

exports.providerAppointment = catchAsync(async (req, res, next) => {
  let page = req.query.page || 1;
  let limit = req.query.limit || 5;
  const token = req.headers["p-access-token"];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (!decoded.id) {
    return new AppError("Please Provide Provider details", 400);
  }
  let providerDoctor = await Doctor.find({ hospital: decoded.id });
  let DoctorId = [];
  providerDoctor.map((doctor, index) => DoctorId.push(doctor.id));
  let total = await Appointment.find({ DoctorId: { $in: DoctorId } }).count();
  let data = await Appointment.find({ DoctorId: { $in: DoctorId } })
    .sort({
      createdAt: -1,
    })
    .skip((page - 1) * limit)
    .limit(limit);
  res.status(200).json({
    status: "success",
    total: total,
    data,
  });
});

exports.createAppointment = catchAsync(async (req, res, next) => {
  const token = req.headers["x-access-token"];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (!decoded.id) {
    return new AppError("Please Provide User details", 400);
  }

  const appointment = await Appointment.create({
    user: decoded.id,
    doctor: req.body.doctor,
    registrator: req.body.registrator,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    age: req.body.age * 1,
    gender: req.body.gender,
    mobileNo: req.body.mobileNo * 1,
    address: req.body.address,
    city: req.body.city,
    state: req.body.state,
    problem: req.body.problem,
    amountPaid: req.body.amountPaid,
    height: req.body.height,
    weight: req.body.weight,
  });

  if (req.body.paidSource === "offline") {
    appointment.paid = true;
    await appointment.save();
  }
  res.status(200).json({
    status: "success",
    appointment,
  });
});

exports.updateAppointment = catchAsync(async (req, res, next) => {
  const token = req.headers["x-access-token"] || req.headers["d-access-token"];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (!decoded.id) {
    return new AppError("Please Provide User details", 400);
  }
  let appointmentId = req.body.aid;
  let appointment = await Appointment.findByIdAndUpdate(
    appointmentId,
    {
      isCancelled: req.body.isCancelled,
      cancelledReason: req.body.cancelledReason,
      isPrescribed: req.body.isPrescribed,
      prescriptionNote: req.body.prescriptionNote,
      prescriptionTime: req.body.prescriptionTime,
      prescriptionNextDate: req.body.prescriptionNextDate,
    },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    appointment,
  });
});

exports.ProviderCreateAppointment = catchAsync(async (req, res, next) => {
  const token = req.headers["p-access-token"];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (!decoded.id) {
    return new AppError("Please Provide Provider details", 400);
  }

  //Check If User Exist
  let CheckUser = await User.findOne({ mobileNo: req.body.mobileNo });
  if (CheckUser) {
    const appointment = await Appointment.create({
      user: CheckUser.id,
      doctor: req.body.doctor,
      registrator: req.body.registrator,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      age: req.body.age * 1,
      gender: req.body.gender,
      mobileNo: req.body.mobileNo * 1,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      problem: req.body.problem,
      amountPaid: req.body.amountPaid,
    });
    if (req.body.paidSource === "offline") {
      appointment.paid = true;
      appointment.save();
    }
    res.status(200).json({
      status: "success",
      appointment,
    });
  } else {
    // If User doesn't Exist Create User And Appointment
    let password = await Math.random().toString(36).substr(2, 10);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    let NewUser = await User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      mobileNo: req.body.mobileNo,
      password: hashedPassword,
      gender: req.body.gender,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
    });
    if (NewUser) {
      //Send UserId and Password to mobileNo
      // Sms.newUser(NewUser.mobileNo, password);
      console.log("UId - ", NewUser.mobileNo, "Pwd - ", password);

      // Create Appointment
      const appointment = await Appointment.create({
        user: NewUser.id,
        doctor: req.body.doctor,
        registrator: req.body.registrator,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        age: req.body.age * 1,
        mobileNo: req.body.mobileNo * 1,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        problem: req.body.problem,
      });
      if (req.body.paidSource === "offline") {
        appointment.paid = true;
        appointment.save();
      }
      res.status(200).json({
        status: "success",
        appointment,
      });
    }
  }
});

exports.prescription = catchAsync(async (req, res, next) => {
  const token = req.headers["x-access-token"];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (!decoded.id) {
    return new AppError("Please Provide User details", 400);
  }
  let prescription = await Appointment.find({
    user: { $in: decoded.id },
    isPrescribed: true,
  }).sort({
    createdAt: -1,
  });
  res.status(200).json({
    status: "success",
    prescription,
  });
});

exports.doctorPrescription = catchAsync(async (req, res, next) => {
  const token = req.headers["d-access-token"];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  let appointment = await Appointment.find({
    DoctorId: { $in: decoded.id },
    isPrescribed: true,
  }).sort({ createdAt: -1 });
  res.status(200).json({
    status: "success",
    appointment,
  });
});

exports.appointmentByDate = catchAsync(async (req, res, next) => {
  const token = req.uid;
  let count = await Appointment.aggregate([
    { $match: { doctor: { $eq: new mongoose.Types.ObjectId(token) } } },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%d-%m-%Y",
            date: "$createdAt",
            timezone: "Asia/Kolkata",
          },
        },
        count: { $sum: 1 },
      },
    },
  ]).limit(15);
  res.status(200).json({
    status: "success",
    count,
  });
});

exports.totalSalesToday = catchAsync(async (req, res, next) => {
  const token = req.uid;
  let todayDate = new Date();
  let formattedDate = `${todayDate.toISOString().split("T")[0]}`;
  let totalAppointmentToday = await Appointment.find({
    DoctorId: { $in: token },
    createdAt: {
      $gte: `${formattedDate}T00:00:00+05:30`,
      $lte: `${formattedDate}T23:59:59+05:30`,
    },
    isCancelled: false,
  }).count();
  let totalPrescriptionToday = await Appointment.find({
    DoctorId: { $in: token },
    createdAt: {
      $gte: `${formattedDate}T00:00:00+05:30`,
      $lte: `${formattedDate}T23:59:59+05:30`,
    },
    isPrescribed: true,
  }).count();
  let price = await Doctor.findById(token);
  res.status(200).json({
    status: "success",
    total: totalAppointmentToday,
    fees: price.fees,
    totalSale: totalAppointmentToday * price.fees,
    totalPrescriptionToday: totalPrescriptionToday,
  });
});

exports.GeneratePrescription = catchAsync(async (req, res, next) => {
  let prescription = await Appointment.findById(req.params.aid).populate(
    "doctor user"
  );
  res.status(200).send({
    status: "Success",
    prescription,
  });

  // if (prescription?.isPrescribed) {
  // GenerateReport({
  //   path: `report.pdf`,
  //   doctorName: `Dr.${prescription?.doctor?.firstName} ${prescription?.doctor?.lastName}`,
  //   education: `${prescription?.doctor?.education.toString()}`,
  //   registrationNo: `${prescription?.registration}`,
  //   specialists: `${prescription?.doctor?.specialists.toString()}`,
  //   hospitalName: `${prescription?.doctor?.hospital?.ProviderName}`,
  //   hospitalAddress: `${prescription?.doctor?.hospital?.Address},${prescription?.doctor?.hospital?.city}`,
  //   contactNo: `${prescription?.doctor?.hospital?.mobileNo}`,
  //   patientName: `${prescription?.fullName}`,
  //   age: `${prescription?.age}`,
  //   gender: `${prescription?.gender}`,
  //   prescriptionDate: `${prescription?.prescriptionDate}`,
  //   cMobileNo: `${prescription?.mobileNo}`,
  //   cAddress: `${prescription?.address}`,
  //   problem: `${prescription?.problem}`,
  //   prescriptionNote: `${prescription?.prescriptionNote}`,
  // });

  //   res.render("prescription", {
  //     drName: `Dr.${prescription?.doctor?.firstName} ${prescription?.doctor?.lastName}`,
  //     education: `${prescription?.doctor?.education.toString()}`,
  //     registrationNo: `${prescription?.registration}`,
  //     specialists: `${prescription?.doctor?.specialists.toString()}`,
  //     hospitalName: `${prescription?.doctor?.hospital?.ProviderName}`,
  //     hospitalAddress: `${prescription?.doctor?.hospital?.Address},${prescription?.doctor?.hospital?.city}`,
  //     contactNo: `${prescription?.doctor?.hospital?.mobileNo}`,
  //     patientName: `${prescription?.fullName}`,
  //     age: `${prescription?.age}`,
  //     gender: `${prescription?.gender}`,
  //     prescriptionDate: `${prescription?.prescriptionDate}`,
  //     cMobileNo: `${prescription?.mobileNo}`,
  //     cAddress: `${prescription?.address}`,
  //     problem: `${prescription?.problem}`,
  //     prescriptionNote: `${prescription?.prescriptionNote}`,
  //   });
  // } else {
  //   res.status(404).send({
  //     status: "User Is Not Prescribed",
  //   });
  // }
});

// https://github.com/rknell/url2pdf

exports.DownloadPrescription = catchAsync(async (req, res, next) => {
  const aid = req.params.aid;
  const pdfUrl = path.join(__dirname, "../utils", "report.pdf");
  let prescription = await Appointment.findById(aid);

  if (prescription?.isPrescribed) {
    // try {
    //   fetch(
    //     `${req.protocol}://${req.get("host")}` + `/api/gen-prescription/${aid}`,
    //     { method: "GET", timeout: 2000 }
    //   )
    //     .then((response) => response.json())
    //     .then((response) => console.log(response))
    //     .catch((err) => console.error(err));
    // } catch (err) {
    //   console.log(err);
    // }

    url2pdf
      .renderPdf(
        `${req.protocol}://${req.get("host")}` + `/api/gen-prescription/${aid}`,
        {
          format: "A4",
          saveDir: path.join(__dirname, "pdfTemp"),
        }
      )
      .then(function (path) {
        res.sendFile(path);
      })
      .catch(function (err) {
        res.status(500).json(err);
      });
  } else {
    res.status(200).send({
      status: "User Is Not Prescribed",
    });
  }
});

exports.billing = catchAsync(async (req, res, next) => {
  const billing = await Billing.create({
    appointment: req.body.aid,
    itemName: req.body.itemName,
    price: req.body.price,
    quantity: req.body.quantity,
  });
  res.status(200).json({
    status: "success",
    billing,
  });
});

exports.billings = catchAsync(async (req, res, next) => {
  const billings = await Billing.find({
    appointment: req.query.aid,
  });
  res.status(200).json({
    status: "success",
    billings,
    count: billings.length,
  });
});

exports.uploadReport = Image.uploadReport(Appointment, "prescription");
exports.uploadPrescription = Image.uploadPrescription(
  Appointment,
  "prescription"
);
