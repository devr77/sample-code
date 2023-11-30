const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const morgan = require("morgan");

const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const basicAuth = require("express-basic-auth");
const path = require("path");
const Sentry = require("@sentry/node");

app.use(cors({ origin: "http://localhost:3000", credentials: true }));

const ErrorController = require("./controllers/errorController");

const userRouter = require("./routes/userRoutes");
const AppointmentRouter = require("./routes/appointmentRoutes");
const ProviderRouter = require("./routes/providerRoutes");
const doctorROuter = require("./routes/doctorRoutes");
const ImageRouter = require("./routes/ImageRoutes");
const VerificationRouter = require("./routes/verificationRoutes");
const VideoRouter = require("./routes/videoRoutes");
const { Metrics } = require("./utils/Metrics");
const logger = require("./utils/Logging");
const MainUtility = require("./utils/MainUtility");
const { RegisterSocketServer } = require("./SocketServer");

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("views"));

app.use(compression());
// app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

Sentry.init({
  dsn: process.env.SENTRY_TOKEN,
});

app.use(Sentry.Handlers.requestHandler());

app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  console.log(req.body);
  next();
});

app.use(
  morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"),
      "-",
      tokens["response-time"](req, res),
      "ms",
    ].join(" ");
  })
);

app.use(
  require("prerender-node").set("prerenderToken", process.env.PRENDER_TOKEN)
);

const morganMiddleware = morgan(
  function (tokens, req, res) {
    return JSON.stringify({
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      status: Number.parseFloat(tokens.status(req, res)),
      content_length: tokens.res(req, res, "content-length"),
      response_time: Number.parseFloat(tokens["response-time"](req, res)),
    });
  },
  {
    stream: {
      // Configure Morgan to use our custom logger with the http severity
      write: (message) => {
        const data = JSON.parse(message);
        logger.http(`incoming-request`, data);
      },
    },
  }
);

app.use(morganMiddleware);

logger;

// Heap Memory  memory storage
app.get(
  "/dev",
  basicAuth({
    challenge: true,
    users: { dev: "dev" },
  }),
  Metrics
);

app.use("/api/", userRouter, AppointmentRouter, VideoRouter);
app.use("/api/verify", VerificationRouter);
app.use("/api/provider", ProviderRouter);
app.use("/api/doctor", doctorROuter);
app.use("/api/image", ImageRouter);

// app.use(ErrorController);

// Main Utility File
MainUtility();

app.use((req, res, next) => {
  if (/(.ico|.js|.css|.jpg|.png|.map|.txt|.xml)$/i.test(req.path)) {
    next();
  } else {
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
    res.header("Expires", "-1");
    res.header("Pragma", "no-cache");
    res.sendFile(path.join(__dirname, "build", "index.html"));
  }
});

app.use(express.static(path.join(__dirname, "build")));

app.get("*", function (req, res) {
  express.static(path.join(path.join(__dirname, "build", "index.html")));
});

app.use(Sentry.Handlers.errorHandler());

// Socket Server Instance
RegisterSocketServer(server);

const port = process.env.PORT;
server.listen(port, function () {
  console.log(`Listening on port ${port}`);
});

module.exports = server;
