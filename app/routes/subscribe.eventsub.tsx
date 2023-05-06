import type { LoaderArgs } from "@remix-run/node";

import { emitter } from "~/services/emitter.server";
import { twitch } from "~/services/twitch.server";

import { eventStream } from "remix-utils";

type EventTypes =
  | "stream.offline"
  | "stream.online"
  | "channel.follow"
  | "channel.raid"
  | "channel.subscribe"
  | "channel.channel_points_custom_reward_redemption.add";

type CPRedeemEvent = {
  id: string;
  broadcaster_user_id: string;
  broadcaster_user_login: string;
  broadcaster_user_name: string;
  user_id: string;
  user_login: string;
  user_name: string;
  user_input: string;
  status: string;
  reward: {
    id: string;
    title: string;
    cost: number;
    prompt: string;
  };
  redeemed_at: string;
};

export async function loader({ request }: LoaderArgs) {
  return eventStream(request.signal, function setup(send) {
    function handle(type: EventTypes, event: CPRedeemEvent) {
      if (type === "channel.channel_points_custom_reward_redemption.add") {
        handleRedeemChannelPoints(event);
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

    emitter.on("new-event", handle);

    return function clear() {
      emitter.off("new-event", handle);
    };
  });
}
