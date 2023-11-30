const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");

exports.UserLogin = (req, res, next) => {
  const token = req.headers["x-access-token"];
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      res.status(401).json({
        status: "Jwt Expired",
      });
    }
  }

  if (!decoded?.id) {
    return new AppError("Please Provide User details", 400);
  } else {
    req.uid = decoded.id;
    next();
  }
};

exports.DoctorLogin = (req, res, next) => {
  const token = req.headers["d-access-token"];
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      res.status(401).json({
        status: "Jwt Expired",
      });
    }
  }

  if (!decoded?.id) {
    return new AppError("Please Provide User details", 400);
  } else {
    req.uid = decoded.id;
    next();
  }
};

exports.ProviderLogin = (req, res, next) => {
  const token = req.headers["p-access-token"];
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      res.status(401).json({
        status: "Jwt Expired",
      });
    }
  }

  if (!decoded?.id) {
    return new AppError("Please Provide User details", 400);
  } else {
    req.uid = decoded.id;
    next();
  }
};
