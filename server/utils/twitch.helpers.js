const { ApiClient } = require("@twurple/api");
const { AppTokenAuthProvider } = require("@twurple/auth");

const authProvider = new AppTokenAuthProvider(
  process.env.TWITCH_CLIENT_ID,
  process.env.TWITCH_CLIENT_SECRET
);

const client = new ApiClient({ authProvider });

exports.twitchClient = client;

exports.MessageTypes = {
  CALLBACK_VERIFICATION: "webhook_callback_verification",
  NOTIFICATION: "notification",
  REVOCATION: "revocation"
};

exports.NotificationTypes = {
  CHANNEL: {
    FOLLOW: "channel.follow",
    REDEEM_CUSTOM_REWARD: "channel.channel_points_custom_reward_redemption.add",
    SUBSCRIBE: "channel.subscribe"
  },
  STREAM: {
    OFFLINE: "stream.offline",
    ONLINE: "stream.online"
  }
};
