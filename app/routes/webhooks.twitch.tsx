import type { ActionArgs } from "@remix-run/node";
import { json, Response } from "@remix-run/node";
import { emitter } from "~/utils/emitter.server";
import { withVerifyTwitch } from "~/utils/twitch.server";

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
      if (type === "stream.online") {
        // todo
        console.log("stream online");
      } else if (
        type === "channel.follow" ||
        type === "channel.raid" ||
        type === "channel.subscribe"
      ) {
        // await sendAlert(type, event);
      } else if (
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
