const crypto = require("crypto");
const logger = require("../utils/logger");

const twitchSigningSecret = process.env.TWITCH_SIGNING_SECRET;

const verifyTwitchSignature = (req, _res, buf, _encoding) => {
  const messageId = req.header("Twitch-Eventsub-Message-Id");
  const timestamp = req.header("Twitch-Eventsub-Message-Timestamp");
  const messageSignature = req.header("Twitch-Eventsub-Message-Signature");
  const time = Math.floor(new Date().getTime() / 1000);

  if (Math.abs(time - timestamp) > 600) {
    // needs to be < 10 minutes
    logger.error(
      `Verification Failed: timestamp > 10 minutes. Message Id: ${messageId}.`
    );
    throw new Error("Ignore this request.");
  }

  if (!twitchSigningSecret) {
    logger.error(`Twitch signing secret is empty.`);
    throw new Error("Twitch signing secret is empty.");
  }

  const computedSignature =
    "sha256=" +
    crypto
      .createHmac("sha256", twitchSigningSecret)
      .update(messageId + timestamp + buf)
      .digest("hex");

  if (messageSignature !== computedSignature) {
    logger.error(
      `Verification Failed: Signature doesn't match. Message Id: ${messageId}. Sent: ${messageSignature}, Computed: ${computedSignature}`
    );
    throw new Error("Invalid signature.");
  }
};

module.exports = verifyTwitchSignature;
