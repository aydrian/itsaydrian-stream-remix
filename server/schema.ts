import { pubsub, CHANNELS } from "./pub-sub";
import { twitchClient } from "./utils/twitch.helpers";
// Construct a schema, using GraphQL schema language
export const typeDefs = `#graphql
type Query {
  numberSix: Int! # Should always return the number 6 when queried
  numberSeven: Int! # Should always return 7
}

type Subscription {
  userFollowed: TwitchChannelEvent
  userSubscribed: TwitchChannelEvent
  customRewardRedeemed: TwitchRewardRedeemEvent
}

type TwitchChannelEvent {
  user: TwitchUser!
}

type TwitchRewardRedeemEvent {
  user_input: String
  redeemed_at: String
  reward: TwitchReward!
  user: TwitchUser!
}

type TwitchReward {
  id: String
  title: String
  cost: Int,
  prompt: String
}

type TwitchUser {
  id: String
  name: String
  displayName: String
  profilePictureUrl: String
}
`;

// Provide resolver functions for your schema fields
export const resolvers = {
  Query: {
    numberSix() {
      return 6;
    },
    numberSeven() {
      return 7;
    }
  },
  Subscription: {
    customRewardRedeemed: {
      resolve: async ({ event }, _args, _context, _info) => {
        console.log({ event });
        const user = await twitchClient.users.getUserById(event.user_id);
        console.log({ user });
        return {
          user_input: event.user_input,
          redeemed_at: event.redeemed_at,
          user: {
            id: user.id,
            name: user.name,
            displayName: user.displayName,
            profilePictureUrl: user.profilePictureUrl
          },
          reward: event.reward
        };
      },
      subscribe: () =>
        pubsub.asyncIterator(CHANNELS.EVENTSUB.CHANNEL.REDEEM_CUSTOM_REWARD)
    },
    userFollowed: {
      resolve: async ({ event }, _args, _context, _info) => {
        const user = await twitchClient.users.getUserById(event.user_id);
        return {
          user: {
            id: user.id,
            name: user.name,
            displayName: user.displayName,
            profilePictureUrl: user.profilePictureUrl
          }
        };
      },
      subscribe: () => pubsub.asyncIterator(CHANNELS.EVENTSUB.CHANNEL.FOLLOW)
    },
    userSubscribed: {
      resolve: async ({ event }, _args, _context, _info) => {
        const user = await twitchClient.users.getUserById(event.user_id);
        return {
          user: {
            id: user.id,
            name: user.name,
            displayName: user.displayName,
            profilePictureUrl: user.profilePictureUrl
          }
        };
      },
      subscribe: () => pubsub.asyncIterator(CHANNELS.EVENTSUB.CHANNEL.SUBSCRIBE)
    }
  }
};
