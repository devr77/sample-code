const nodemailer = require("nodemailer");
const pug = require("pug");

var transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Account Creation
const sendWelcome = (uFname, uEmail, fUrl) => {
  const Finalhtml = pug.renderFile(`${__dirname}/../views/email/welcome.pug`, {
    firstName: uFname,
    url: fUrl,
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: uEmail,
    subject: "Welcome to Medico",
    html: Finalhtml,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email Response" + info.response);
    }
  });
};

// Password Reset Email
exports.sendPasswordReset = (uFname, uEmail, fUrl) => {
  const Finalhtml = pug.renderFile(
    `${__dirname}/../views/email/passwordReset.pug`,
    {
      firstName: uFname,
      url: fUrl,
    }
  );

  const mailOptions = {
    from: ` Medico<${process.env.EMAIL_FROM}>`,
    to: uEmail,
    subject: "Password Reset",
    html: Finalhtml,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email Response" + info.response);
    }
  });
};

// EMail Verification
exports.sendEmailVerify = (Fname, Email, url) => {
  const Finalhtml = pug.renderFile(
    `${__dirname}/../views/email/emailVerify.pug`,
    {
      firstName: Fname,
      url: url,
    }
  );

  const mailOptions = {
    from: ` Medico<${process.env.EMAIL_FROM}>`,
    to: Email,
    subject: "Verify Email",
    html: Finalhtml,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email Response" + info.response);
    }
  });
};

// Send Prescription
exports.downloadPrescription = (Email) => {
  const mailOptions = {
    from: ` Medico<${process.env.EMAIL_FROM}>`,
    to: Email,
    subject: "Download Prescription",
    attachments: [
      {
        filename: "prescription.pdf",
        path: __dirname + "/12345.pdf",
      },
    ],
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email Response" + info.response);
    }
  });
};

// New Appointment Logic
// Upcoming Notification
// Feedback Logic

// module.exports = sendMail;
