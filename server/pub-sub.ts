import { PubSub } from "graphql-subscriptions";

export const pubsub = new PubSub();

export const CHANNELS = {
  EVENTSUB: {
    CHANNEL: {
      FOLLOW: "eventsub_channel_follow",
      REDEEM_CUSTOM_REWARD: "eventsub_channel_redeem_custom_reward",
      SUBSCRIBE: "eventsub_channel_subscribe"
    },
    REVOCATION: "eventsub_revocation",
    STREAM: {
      OFFLINE: "eventsub_stream_offline",
      ONLINE: "eventsub_stream_online"
    }
  }
};
