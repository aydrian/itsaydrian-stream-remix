import { ApiClient } from "@twurple/api";
import { AppTokenAuthProvider, StaticAuthProvider } from "@twurple/auth";
import invariant from "tiny-invariant";

type EventSubSubscription = {
  id: string;
  status: string;
  type: string;
  version: string;
  condition: {
    broadcaster_user_id: string;
    reward_id?: string;
  };
  created_at: string;
  transport: {
    method: string;
    callback: string;
  };
  cost: number;
};

type GetEventSubSubscriptionResult = {
  total: number;
  data: Array<EventSubSubscription>;
  max_total_cost: number;
  total_cost: number;
  pagination: object;
};

const twitchClientId = process.env.TWITCH_CLIENT_ID;
invariant(
  typeof twitchClientId === "string",
  "TWITCH_API_CLIENT must be provided"
);
const twitchClientSecret = process.env.TWITCH_CLIENT_SECRET;
invariant(
  typeof twitchClientSecret === "string",
  "TWITCH_CLIENT_SECRET must be provided"
);

const authProvider = new AppTokenAuthProvider(
  twitchClientId,
  twitchClientSecret
);

export const appClient = new ApiClient({ authProvider });

export const getUserClient = (accessToken: string): ApiClient => {
  const authProvider = new StaticAuthProvider(twitchClientId, accessToken);
  return new ApiClient({ authProvider });
};

export const getEventSubSubscriptionsForUser = async (user_id: string) => {
  const { accessToken } = await authProvider.getAppAccessToken();
  const result: GetEventSubSubscriptionResult = await fetch(
    `https://api.twitch.tv/helix/eventsub/subscriptions?${new URLSearchParams({
      user_id
    })}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Client-ID": twitchClientId
      }
    }
  ).then((res) => res.json());
  return result.data;
};
