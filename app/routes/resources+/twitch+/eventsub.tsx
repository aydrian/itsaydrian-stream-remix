import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  json
} from "@remix-run/node";
import { eventStream } from "remix-utils/sse/server";

import { emitter } from "~/utils/emitter.server";
import { twitch, withVerifyTwitch } from "~/utils/twitch.server";

import type {
  CPRedeemEvent,
  Event,
  EventType,
  FollowEvent,
  RaidEvent,
  SubscribeEvent
} from "./types";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return eventStream(request.signal, function setup(send) {
    function handle(type: EventType, event: Event) {
      if (type === "channel.channel_points_custom_reward_redemption.add") {
        return handleRedeemChannelPoints(event as CPRedeemEvent);
      }
      if (type === "channel.follow") {
        return handleFollow(event as FollowEvent);
      }
      if (type === "channel.subscribe") {
        return handleSubscribe(event as SubscribeEvent);
      }
      if (type === "channel.raid") {
        return handleRaid(event as RaidEvent);
      }
    }

    function handleRedeemChannelPoints(event: CPRedeemEvent) {
      twitch.users.getUserById(event.user_id).then((viewer) => {
        send({
          data: JSON.stringify({
            reward: event.reward,
            viewer: {
              displayName: viewer?.displayName,
              id: viewer?.id,
              name: viewer?.name,
              profilePictureUrl: viewer?.profilePictureUrl
            }
          }),
          event: "redeem-channelpoints"
        });
      });
    }

    function handleFollow(event: FollowEvent) {
      twitch.users.getUserById(event.user_id).then((viewer) => {
        send({
          data: JSON.stringify({
            viewer: {
              displayName: viewer?.displayName,
              id: viewer?.id,
              name: viewer?.name,
              profilePictureUrl: viewer?.profilePictureUrl
            }
          }),
          event: "follow"
        });
      });
    }

    function handleSubscribe(event: SubscribeEvent) {
      twitch.users.getUserById(event.user_id).then((viewer) => {
        send({
          data: JSON.stringify({
            isGift: event.is_gift,
            tier: event.tier,
            viewer: {
              displayName: viewer?.displayName,
              id: viewer?.id,
              name: viewer?.name,
              profilePictureUrl: viewer?.profilePictureUrl
            }
          }),
          event: "subscribe"
        });
      });
    }

    function handleRaid(event: RaidEvent) {
      twitch.users
        .getUserById(event.from_broadcaster_user_id)
        .then((raider) => {
          send({
            data: JSON.stringify({
              raider: {
                displayName: raider?.displayName,
                id: raider?.id,
                name: raider?.name,
                profilePictureUrl: raider?.profilePictureUrl
              },
              viewers: event.viewers
            }),
            event: "raid"
          });
        });
    }

    emitter.on("new-event", handle);
    return function clear() {
      emitter.off("new-event", handle);
    };
  });
};

export const action = withVerifyTwitch(
  async ({ request }: ActionFunctionArgs) => {
    if (request.method !== "POST") {
      return json(
        { message: "Method not allowed" },
        { headers: { Allow: "POST" }, status: 405 }
      );
    }
    const body = await request.json();
    const messageType = request.headers.get("twitch-eventsub-message-type");
    if (messageType === "webhook_callback_verification") {
      return new Response(body.challenge, { status: 200 });
    } else if (messageType === "notification") {
      const {
        event,
        subscription: { type }
      } = body;

      console.log(
        `Receiving ${type} request for ${event.broadcaster_user_name}: `,
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
);
