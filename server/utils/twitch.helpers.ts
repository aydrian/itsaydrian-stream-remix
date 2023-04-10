import { ApiClient } from "@twurple/api";
import { AppTokenAuthProvider } from "@twurple/auth";
import invariant from "tiny-invariant";

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
invariant(
  typeof TWITCH_CLIENT_ID === "string",
  "TWITCH_CLIENT_ID should be a string"
);
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;
invariant(
  typeof TWITCH_CLIENT_SECRET === "string",
  "TWITCH_CLIENT_SECRET should be a string"
);

const authProvider = new AppTokenAuthProvider(
  TWITCH_CLIENT_ID,
  TWITCH_CLIENT_SECRET
);

export const twitchClient = new ApiClient({ authProvider });

export const MessageTypes = {
  CALLBACK_VERIFICATION: "webhook_callback_verification",
  NOTIFICATION: "notification",
  REVOCATION: "revocation"
};

export const NotificationTypes = {
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
