const fs = require("fs");
const PDFDocument = require("pdfkit");

let doc = new PDFDocument({ size: "A4", margin: 25 });
exports.GenerateReport = async function GenerateReport(param) {
  generateHeader(
    doc,
    param?.doctorName,
    param?.education,
    param?.registrationNo,
    param?.specialists,
    param?.hospitalName,
    param?.hospitalAddress,
    param?.contactNo
  );
  generateCustomerInformation(
    doc,
    param?.patientName,
    param?.age,
    param?.gender,
    param?.prescriptionDate,
    param?.cMobileNo,
    param?.cAddress,
    param?.problem
  );
  generateCustomerPrescription(doc, param?.prescriptionNote);
  generateFooter(doc);
  doc.end();
  doc.pipe(fs.createWriteStream(`./utils/${param?.path}`));
  console.log("Report Created Successfully ");
};

function generateHeader(
  doc,
  doctorName,
  education,
  registrationNo,
  specialists,
  hospitalName,
  hospitalAddress,
  contactNo
) {
  doc
    .fontSize(20)
    .text(doctorName)
    .fontSize(12)
    .text(education, 25, 50, { align: "left" })
    .text(registrationNo)
    .text(specialists)
    .image("./utils/logo.png", 190, 25, { width: 50 })
    .fontSize(20)
    .text(hospitalName, 200, 25, { align: "right" })
    .fontSize(12)
    .text(hospitalAddress, 50, 50, { align: "right" })
    .text(contactNo, 50, 61, { align: "right" });
  generateHr(doc, 100);
}

function generateCustomerInformation(
  doc,
  patientName,
  age,
  gender,
  prescriptionDate,
  cMobileNo,
  cAddress,
  problem
) {
  doc
    .fontSize(15)
    .text("Name:-" + patientName, 25, 110, { align: "left" })
    .fontSize(15)
    .text("Age:-" + age, 170, 110, { align: "left" })
    .fontSize(15)
    .text("Gender:-" + gender, 250, 110, { align: "left" })
    .fontSize(15)
    .text("Date:-" + prescriptionDate, 200, 110, { align: "right" })
    .fontSize(15)
    .text("Mobile No:-" + cMobileNo, 25, 130, { align: "left" })
    .fontSize(15)
    .text("Address:-" + cAddress, 50, 130, { align: "right" })
    .fontSize(20)
    .text("Problem:-" + problem, 25, 160)
    .fontSize(20)
    .text("Rx:-", 25, 182);
}

function generateCustomerPrescription(doc, prescriptionNote) {
  doc.text(prescriptionNote, 70, 210, { align: "left", underline: true });
}
function generateHr(doc, y) {
  doc.strokeColor("#282b29").lineWidth(1).moveTo(25, y).lineTo(550, y).stroke();
}
function generateFooter(doc) {
  doc
    .fontSize(10)
    .text("Digitally Signed", 200, 750, { align: "right" })
    .fontSize(10)
    .fillColor("red")
    .text(
      "Appointment is Booked On Medico.Com Thank You Visit Us Again",
      50,
      780,
      {
        align: "center",
        width: 500,
        link: "http://medico.ink/",
        underline: true,
      }
    );
}
