const winston = require("winston");
const { Logtail } = require("@logtail/node");
const { LogtailTransport } = require("@logtail/winston");

const logtail = new Logtail(process.env.SOURCETOKEN);

const { combine, timestamp, json, errors } = winston.format;
const logger = winston.createLogger({
  level: "http",
  format: combine(errors({ stack: true }), timestamp(), json()),
  transports: [new LogtailTransport(logtail)],
});

module.exports = logger;
