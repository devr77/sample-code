exports.pushNotification = function PushNotification() {
  const options = {
    method: "POST",
    headers: {
      accept: "application/json",
      Authorization: process.env.Authorization,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      app_id: "de2d4d04-782c-48ed-9edd-4120ecf03b72",
      include_subscription_ids: ["8f9a874c-a3b9-4210-8932-3884f97bb83d"],
      headings: {
        en: "Medico",
      },
      contents: {
        en: "Your Appointment Booked Successfully.Rate if You  Like ✨✨✨✨✨",
      },
      url: "https://medico.ink/login",
      chrome_web_icon: "https://picsum.photos/200",
      chrome_web_image: "https://picsum.photos/200",
    }),
  };

  fetch("https://onesignal.com/api/v1/notifications", options)
    .then((response) => response.json())
    .then((response) => console.log(response))
    .catch((err) => console.error(err));
};
