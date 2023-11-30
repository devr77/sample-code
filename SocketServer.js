const verifyTokenSocket = require("./utils/authserver");

require("events").EventEmitter.defaultMaxListeners = 15;

const RegisterSocketServer = (server) => {
  const io = require("socket.io")(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.use((socket, next) => {
    verifyTokenSocket(socket, next);
  });

  io.on("connection", (socket) => {
    console.log("User Connected", socket.user, socket.doctor, socket.id);

    socket.on("send_messages", (data) => {
      console.log("Message Received from Client", socket.user, socket.id, data);

      //Personal Communication
      socket.emit(socket.id, data);

      // Public Communication
      socket.broadcast.emit("receive_message", data);
      console.log("I emit data to Client ", socket.user, socket.id, data);
    });

    socket.on("receive_video", (data) => {
      console.log(
        "Message Received from Client",
        socket.id,
        socket.doctor,
        data
      );

      socket.broadcast.emit("send_video", data);
      console.log("I emit data to Client ", socket.id, data);
    });

    socket.on("disconnect", function () {
      console.log("User Disconnected", socket.id);
    });

    socket.on("error", (data) => {
      console.log(socket.id, data);
    });
  });

  io.on("disconnect", (reason) => {
    console.log("disconnect", reason);
  });

  io.on("connect_error", (error) => {
    console.log("connect_error", error);
  });

  io.on("error", (error) => {
    console.log("error", error);
  });
};

module.exports = {
  RegisterSocketServer,
};
