import { json, type ActionArgs, type LoaderArgs } from "@remix-run/node";
import { eventStream } from "remix-utils";
import { twitch, withVerifyTwitch } from "~/utils/twitch.server";
import { emitter } from "~/utils/emitter.server";
import type {
  EventSubEvent,
  EventTypes,
  CPRedeemEvent,
  FollowEvent,
  RaidEvent,
  SubscribeEvent
} from "~/utils/types";

export const loader = async ({ request }: LoaderArgs) => {
  return eventStream(request.signal, function setup(send) {
    function handle(type: EventTypes, event: EventSubEvent) {
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
          event: "redeem-channelpoints",
          data: JSON.stringify({
            reward: event.reward,
            viewer: {
              id: viewer?.id,
              name: viewer?.name,
              displayName: viewer?.displayName,
              profilePictureUrl: viewer?.profilePictureUrl
            }
          })
        });
      });
    }

    function handleFollow(event: FollowEvent) {
      twitch.users.getUserById(event.user_id).then((viewer) => {
        send({
          event: "follow",
          data: JSON.stringify({
            viewer: {
              id: viewer?.id,
              name: viewer?.name,
              displayName: viewer?.displayName,
              profilePictureUrl: viewer?.profilePictureUrl
            }
          })
        });
      });
    }

    function handleSubscribe(event: SubscribeEvent) {
      twitch.users.getUserById(event.user_id).then((viewer) => {
        send({
          event: "subscribe",
          data: JSON.stringify({
            tier: event.tier,
            isGift: event.is_gift,
            viewer: {
              id: viewer?.id,
              name: viewer?.name,
              displayName: viewer?.displayName,
              profilePictureUrl: viewer?.profilePictureUrl
            }
          })
        });
      });
    }

    function handleRaid(event: RaidEvent) {
      twitch.users
        .getUserById(event.from_broadcaster_user_id)
        .then((raider) => {
          send({
            event: "raid",
            data: JSON.stringify({
              viewers: event.viewers,
              raider: {
                id: raider?.id,
                name: raider?.name,
                displayName: raider?.displayName,
                profilePictureUrl: raider?.profilePictureUrl
              }
            })
          });
        });
    }

    emitter.on("new-event", handle);
    return function clear() {
      emitter.off("new-event", handle);
    };
  });
};

export const action = withVerifyTwitch(async ({ request }: ActionArgs) => {
  if (request.method !== "POST") {
    return json(
      { message: "Method not allowed" },
      { status: 405, headers: { Allow: "POST" } }
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
});
