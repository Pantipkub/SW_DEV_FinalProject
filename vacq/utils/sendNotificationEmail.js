require('dotenv').config({ path: './config/.env' }); // Adjust the path to match the actual location of the .env file 
const mailjet = require('node-mailjet').apiConnect(
  process.env.MJ_APIKEY_PUBLIC,
  process.env.MJ_APIKEY_PRIVATE
);

async function sendNotificationEmail(toEmail, toName, actionType, reservationInfo) {
  const subjectMap = {
    book: "📅 Reservation Confirmed!",
    cancel: "❌ Reservation Cancelled",
    update: "✏️ Reservation Modified"
  };

  const textMap = {
    book: `${reservationInfo}`,
    cancel: `${reservationInfo}`,
    update: `Your reservation has been updated.\nNew Details: \n${reservationInfo}`
  };

  try {
    const result = await mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: process.env.MJ_SENDER_EMAIL,
            Name: "Massage Reminder System"
          },
          To: [
            {
              Email: toEmail,
              Name: toName
            }
          ],
          Subject: subjectMap[actionType],
          TextPart: textMap[actionType]
        }
      ]
    });

    console.log(`Notification sent to ${toEmail} for action: ${actionType}`);
  } catch (err) {
    console.error("❌ Failed to send notification:", err);
  }
}

module.exports = sendNotificationEmail;
