const cron = require("node-cron");
const axios = require("axios");

// Function to delete old messages
const deleteOldMessages = async () => {
  // Calculate the date 30 days ago
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  try {
    // Find messages older than 30 days
    const messagesToDelete = await Message.find({
      createdAt: { $lt: thirtyDaysAgo },
    });

    // Delete the messages
    await Message.deleteMany({
      _id: { $in: messagesToDelete.map((message) => message._id) },
    });

    console.log("Old messages deleted successfully.");
  } catch (error) {
    console.error("Failed to delete old messages:", error.message);
  }
};

// Function to update Heroku config var
const updateHerokuConfigVar = async () => {
  const secretKey = generateSecretKey();

  try {
    const response = await axios.patch(
      "https://api.heroku.com/apps/{your-app-name}/config-vars",
      { SECRET_KEY: secretKey },
      {
        headers: {
          Accept: "application/vnd.heroku+json; version=3",
          Authorization: "Bearer {your-heroku-api-key}",
        },
      }
    );

    console.log("Heroku config var updated successfully.");
  } catch (error) {
    console.error("Failed to update Heroku config var:", error.message);
  }
};

// Schedule the code to run every 30 days (at 00:00)
cron.schedule("0 0 */30 * *", async () => {
  // Delete old messages
  await deleteOldMessages();

  // Update Heroku config var
  await updateHerokuConfigVar();
});

console.log(
  "Scheduled job to delete old messages and update Heroku config var every 30 days."
);
