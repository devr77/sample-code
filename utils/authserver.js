const jwt = require("jsonwebtoken");

const config = process.env.JWT_SECRET;

const verifyTokenSocket = (socket, next) => {
  const token = socket.handshake.auth?.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, config);
      socket.user = decoded?.id;
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        const socketError = new Error("NOT_AUTHORIZED");
        return next(socketError);
      }
    }

    next();
  } else {
    const doctor = socket.handshake.auth?.doctor;
    try {
      const decoded = jwt.verify(doctor, config);
      socket.doctor = decoded?.id;
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        const socketError = new Error("NOT_AUTHORIZED");
        return next(socketError);
      }
    }

    next();
  }
};

module.exports = verifyTokenSocket;
