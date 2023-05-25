//npm install -g railway

const { execSync } = require('child_process');
const crypto = require('crypto');
const axios = require('axios');
const cron = require('node-cron');

const generateSecretKey = (length) => {
  const buffer = crypto.randomBytes(length);
  return buffer.toString('hex');
};

const updateEnvVariableRailway = async (name, value) => {
  try {
    // Run the Railway CLI command to update the environment variable
    const command = `railway env set ${name}=${value}`;
    execSync(command, { stdio: 'inherit' });
    console.log(`Environment variable ${name} updated successfully in Railway.`);
  } catch (error) {
    console.error(`Error updating environment variable ${name} in Railway: ${error.message}`);
  }
};

const updateEnvVariableNetlify = async (siteId, apiAccessToken, name, value) => {
  try {
    // Send a PATCH request to the Netlify API to update the environment variable
    const url = `https://api.netlify.com/api/v1/sites/${siteId}/env`;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiAccessToken}`
    };
    const data = {
      [name]: value
    };
    await axios.patch(url, data, { headers });
    console.log(`Environment variable ${name} updated successfully in Netlify.`);
  } catch (error) {
    console.error(`Error updating environment variable ${name} in Netlify: ${error.message}`);
  }
};

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

const autoUpdateSecretKey = async () => {
  // Generate a new secret key
  const secretKey = generateSecretKey(32);
  console.log('VITE_SECRET_KEY:', secretKey);

  // Update the environment variable 'API_KEY' with the new secret key in Railway
  await updateEnvVariableRailway('VITE_SECRET_KEY', secretKey);

  // Update the environment variable 'API_KEY' with the new secret key in Netlify
  const netlifySiteId = 'YOUR_NETLIFY_SITE_ID';
  const netlifyApiAccessToken = 'YOUR_NETLIFY_API_ACCESS_TOKEN';
  await updateEnvVariableNetlify(netlifySiteId, netlifyApiAccessToken, 'VITE_SECRET_KEY', secretKey);
};

// Schedule the automatic update to run every 30 days
cron.schedule('0 0 1 */30 *', () => {
  autoUpdateSecretKey();
  deleteOldMessages();
});

// Run the initial update immediately
autoUpdateSecretKey();