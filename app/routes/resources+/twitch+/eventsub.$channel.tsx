import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  json
} from "@remix-run/node";
import { useEventSource } from "remix-utils/sse/react";
import { eventStream } from "remix-utils/sse/server";

import { emitter } from "~/utils/emitter.server";
import { getTwitchUser } from "~/utils/twitch.server";

import type {
  CPRedeemEvent,
  EventType,
  FollowEvent,
  RaidEvent,
  SubscribeEvent
} from "./types";

type Event = CPRedeemEvent | FollowEvent | RaidEvent | SubscribeEvent;

type Viewer = {
  displayName?: string;
  id?: string;
  name?: string;
  profilePictureUrl?: string;
};

export type CPRMessage = {
  reward: CPRedeemEvent["reward"];
  viewer: Viewer;
};

export type FollowMessage = {
  viewer: Viewer;
};

export type SubscribeMessage = {
  isGift: boolean;
  tier: string;
  viewer: Viewer;
};

export type RaidMessage = {
  raider: Viewer;
  viewers: string;
};

type StreamMessage<T = FollowMessage | RaidMessage | SubscribeMessage> = {
  event: T;
  type: "custom-prize-redemption" | "follow" | "raid" | "subscribe";
};

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const { channel } = params;
  if (!channel) {
    throw new Response(null, { status: 400, statusText: "Bad Request" });
  }
  return eventStream(request.signal, function setup(send) {
    async function handle(type: EventType, event: Event) {
      if (type === "channel.channel_points_custom_reward_redemption.add") {
        const cprEvent = event as CPRedeemEvent;
        const viewer = await getTwitchUser(cprEvent.user_id);
        return send({
          data: JSON.stringify({
            event: {
              reward: cprEvent.reward,
              viewer: {
                displayName: viewer?.displayName,
                id: viewer?.id,
                name: viewer?.name,
                profilePictureUrl: viewer?.profilePictureUrl
              }
            },
            type: "custom-prize-redemption"
          } as StreamMessage<CPRMessage>)
        });
      }
      if (type === "channel.follow") {
        const followEvent = event as FollowEvent;
        const viewer = await getTwitchUser(followEvent.user_id);
        return send({
          data: JSON.stringify({
            event: {
              viewer: {
                displayName: viewer?.displayName,
                id: viewer?.id,
                name: viewer?.name,
                profilePictureUrl: viewer?.profilePictureUrl
              }
            },
            type: "follow"
          } as StreamMessage<FollowMessage>)
        });
      }
      if (type === "channel.subscribe") {
        const subscribeEvent = event as SubscribeEvent;
        const viewer = await getTwitchUser(subscribeEvent.user_id);
        return send({
          data: JSON.stringify({
            event: {
              isGift: subscribeEvent.is_gift,
              tier: subscribeEvent.tier,
              viewer: {
                displayName: viewer?.displayName,
                id: viewer?.id,
                name: viewer?.name,
                profilePictureUrl: viewer?.profilePictureUrl
              }
            },
            type: "subscribe"
          } as StreamMessage<SubscribeMessage>)
        });
      }
      if (type === "channel.raid") {
        const raidEvent = event as RaidEvent;
        const raider = await getTwitchUser(raidEvent.from_broadcaster_user_id);
        return send({
          data: JSON.stringify({
            event: {
              raider: {
                displayName: raider?.displayName,
                id: raider?.id,
                name: raider?.name,
                profilePictureUrl: raider?.profilePictureUrl
              },
              viewers: raidEvent.viewers
            },
            type: "raid"
          } as StreamMessage<RaidMessage>)
        });
      }
    }

    emitter.on("new-event", handle);
    return function clear() {
      emitter.off("new-event", handle);
    };
  });
};

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json(
      { message: "Method not allowed" },
      { headers: { Allow: "POST" }, status: 405 }
    );
  }
  const body = await request.json();
  const messageType = request.headers.get("twitch-eventsub-message-type");
  const messageId = request.headers.get("twitch-eventsub-message-id");
  if (messageType === "webhook_callback_verification") {
    return new Response(body.challenge, { status: 200 });
  } else if (messageType === "notification") {
    const {
      event,
      subscription: { type }
    } = body;

    console.log(
      `Receiving message ${messageId}, ${type} request for ${event.broadcaster_user_name}: `,
      event
    );

    try {
      if (
        type === "stream.online" ||
        type === "channel.follow" ||
        type === "channel.raid" ||
        type === "channel.subscribe" ||
        type === "channel.channel_points_custom_reward_redemption.add"
      ) {
        emitter.emit("new-event", type, event);
      }
    } catch (ex) {
      console.log(
        `An error occurred sending the ${type} notification for ${event.broadcaster_user_name}: `,
        ex
      );
    }
  }

  return new Response(null, { status: 200 });
}

export function useEventSub(channel: string): {
  customPrizeRedemption?: CPRMessage;
  follow?: FollowMessage;
  raid?: RaidMessage;
  subscribe?: SubscribeMessage;
} {
  const eventMessage = useEventSource(`/resources/twitch/eventsub/${channel}`, {
    event: "message"
  });
  const event = eventMessage
    ? (JSON.parse(eventMessage) as StreamMessage)
    : undefined;

  return {
    customPrizeRedemption:
      event?.type === "custom-prize-redemption"
        ? (event.event as CPRMessage)
        : undefined,
    follow:
      event?.type === "follow" ? (event.event as FollowMessage) : undefined,
    raid: event?.type === "raid" ? (event.event as RaidMessage) : undefined,
    subscribe:
      event?.type === "subscribe"
        ? (event.event as SubscribeMessage)
        : undefined
  };
}
