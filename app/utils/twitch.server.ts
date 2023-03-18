import type { ActionFunction } from "@remix-run/node";
import { Response } from "@remix-run/node";
import crypto from "crypto";
import invariant from "tiny-invariant";
import { ApiClient } from "@twurple/api";
import { AppTokenAuthProvider } from "@twurple/auth";

const twitchSigningSecret = process.env.TWITCH_SIGNING_SECRET;

export const withVerifyTwitch = (actionFunction: ActionFunction) => {
  const action: ActionFunction = async (args) => {
    const { request } = args;
    const messageId = request.headers.get("twitch-eventsub-message-id");
    const timestamp = request.headers.get("twitch-eventsub-message-timestamp");
    invariant(typeof timestamp === "string", "timestamp should be a string");
    const messageSignature = request.headers.get(
      "twitch-eventsub-message-signature"
    );

    if (!twitchSigningSecret) {
      console.log(`Twitch signing secret is empty.`);
      return new Response("Signature verification failed.", { status: 422 });
    }

    // needs to be < 10 minutes
    const time = Math.floor(new Date().getTime() / 1000);
    const timestampTime = new Date(timestamp).getTime() / 1000;
    if (Math.abs(time - timestampTime) > 600) {
      console.log(
        `Verification Failed: timestamp > 10 minutes. Message Id: ${messageId}.`
      );
      return new Response("Ignore this request.", { status: 422 });
    }

    const body = await request.clone().text();
    const computedSignature =
      "sha256=" +
      crypto
        .createHmac("sha256", twitchSigningSecret)
        .update(messageId + timestamp + body)
        .digest("hex");

    if (messageSignature !== computedSignature) {
      console.log(`Provided signature does not match computed signature.`);
      console.log(`Message ${messageId} Signature: `, messageSignature);
      console.log(
        `Message ${messageId} Computed Signature: ${computedSignature}`
      );
      return new Response("Signature verification failed.", { status: 422 });
    }

    return actionFunction(args);
  };

  return action;
};

const authProvider = new AppTokenAuthProvider(
  process.env.TWITCH_CLIENT_ID!,
  process.env.TWITCH_CLIENT_SECRET!
);

export const twitch = new ApiClient({ authProvider });

export interface EventSubEvent {
  user_id: string;
}
