var Admin = require("firebase-admin");

var serviceAccount = require("./medico-29d91-firebase-adminsdk-fo4hz-8de0699c65.json");

Admin.initializeApp({
  credential: Admin.credential.cert(serviceAccount),
});

var message = {
  notification: {
    title: "Message from Eye Hospital",
    body: "You have to take Medicine XYZ",
  },
  data: {
    account: "Savings",
    balance: "$3020.25",
  },
};

var options = {
  priority: "high",
  timeToLive: 60 * 60 * 24,
};

exports.sendNotification = (token) => {
  Admin.messaging()
    .sendToDevice(token, message, options)
    .then((response) => {
      // Response is a message ID string.
      console.log("Successfully sent message:", response);
    })
    .catch((error) => {
      console.log("Error sending message:", error);
    });
};
