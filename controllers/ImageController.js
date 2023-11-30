const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const aws = require("aws-sdk");
const uuid = require("uuid");

aws.config.update({
  secretAccessKey: process.env.ACCESS_SECRET,
  accessKeyId: process.env.ACCESS_KEY,
  region: process.env.REGION,
});

const s3 = new aws.S3();
const BUCKET = process.env.BUCKET;

exports.uploadUserImage = catchAsync(async function (req, res, next) {
  const key = `${uuid.v4()}.png`;
  const folder = req.body.folder;
  s3.getSignedUrl(
    "putObject",
    {
      Bucket: BUCKET,
      Key: `${folder}/${key}`,
      ContentType: "image/*",
    },
    (err, url) =>
      res.status(200).send({
        url: url,
        key: key,
      })
  );
});

exports.deleteUserImage = catchAsync(async function (req, res, next) {
  const key = req.params.filename;
  const folder = req.body.folder;
  await s3.deleteObject({ Bucket: BUCKET, Key: `${folder}/${key}` }).promise();
  res.status(200).send({
    status: "Image deleted successfully",
  });
});

exports.deleteImage = async (folder, key) => {
  return await s3
    .deleteObject({ Bucket: BUCKET, Key: `${folder}/${key}` })
    .promise();
};

exports.updateImage = (Model, folder) =>
  catchAsync(async (req, res, next) => {
    const key = req.body.key;
    const user = await Model.findByIdAndUpdate(req.uid, {
      image: key,
    });
    await s3
      .deleteObject({ Bucket: BUCKET, Key: `${folder}/${user?.image}` })
      .promise();
    res.status(200).json({
      status: "Image Updated Successfully",
      user,
    });
  });

exports.removeImage = (Model, folder) =>
  catchAsync(async (req, res, next) => {
    const key = req.body.key;
    await s3
      .deleteObject({ Bucket: BUCKET, Key: `${folder}/${key}` })
      .promise();
    const user = await Model.findByIdAndUpdate(
      req.uid,
      {
        image: null,
      },
      {
        new: true,
      }
    );

    res.status(200).json({
      status: "Image Removed Successfully",
      user,
    });
  });

exports.uploadReport = (Model, folder) =>
  catchAsync(async (req, res, next) => {
    const key = req.body.key;
    console.log(Model, folder, key);
  });

exports.uploadPrescription = (Model, folder) =>
  catchAsync(async (req, res, next) => {
    const key = req.body.key;
    console.log(Model, folder, key);
  });
