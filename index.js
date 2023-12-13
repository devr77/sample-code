const mongoose = require("mongoose");
const dotenv = require("dotenv");

mongoose.set("toJSON", { virtuals: true });
mongoose.set("toObject", { virtuals: true });

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION SHUTTING DOWN");
  console.log(err.name, err.message);
  process.exit(1);
});

process.on("MongoServerError", (err) => {
  console.log("Mongoose Eroor");
  console.log(err.name, err.message);
  process.exit(1);
});

const environment = process.env.NODE_ENV;
if (environment === "development") {
  dotenv.config({ path: "dev.env" });
  // Enable Console logging
}
if (environment === "production") {
  dotenv.config({ path: "prod.env" });
  // Logging And Monit CLoud
}

const server = require("./app");
const port = process.env.PORT;
server.listen(port, function () {
  console.log(`Listening on port ${port}`);
});

mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB CONNECTION is successful"));

process.on("SIGTERM", () => {
  console.log("👋 SIGTERM RECEIVED. Shutting down gracefully");
  server.close(() => {
    console.log("💥 Process terminated!");
  });
});
