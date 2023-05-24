import type { ActionFunction } from "@remix-run/node";
import type { HelixSchedule, HelixStream, HelixVideo } from "@twurple/api";
import { Response } from "@remix-run/node";
import crypto from "crypto";
import invariant from "tiny-invariant";
import { ApiClient } from "@twurple/api";
import { AppTokenAuthProvider } from "@twurple/auth";
import { emitter } from "~/utils/emitter.server";

const twitchSigningSecret = process.env.TWITCH_SIGNING_SECRET;
invariant(
  typeof twitchSigningSecret === "string",
  "Be sure to set TWITCH_SIGNING_SECRET"
);

const twitchUserId = process.env.TWITCH_USER_ID;
invariant(
  typeof twitchUserId === "string",
  "Set TWITCH_USER_ID to the broadcaster user id."
);
export const TWITCH_USER_ID = twitchUserId;

export const scheduleToJSON = (schedule: HelixSchedule | null) => {
  if (!schedule) return null;
  const segments = schedule.segments.map((segment) => {
    return {
      id: segment.id,
      title: segment.title,
      categoryName: segment.categoryName,
      isRecurring: segment.isRecurring,
      startDate: segment.startDate,
      endDate: segment.endDate
    };
  });
  return {
    broadcasterName: schedule.broadcasterName,
    broadcasterDisplayName: schedule.broadcasterDisplayName,
    vacationStartDate: schedule.vacationStartDate,
    vacationEndDate: schedule.vacationEndDate,
    segments
  };
};

export const streamToJSON = async (stream: HelixStream | null) => {
  if (!stream) return null;
  const game = await stream.getGame();
  return {
    title: stream.title,
    thumbnailUrl: stream.thumbnailUrl,
    userName: stream.userName,
    userDislayName: stream.userDisplayName,
    gameName: game?.name,
    gameBoxArtUrl: game?.boxArtUrl
  };
};

export const videoToJSON = (video: HelixVideo | null) => {
  if (!video) return null;
  return {
    title: video.title,
    url: video.url,
    thumbnailUrl: video.thumbnailUrl,
    duration: video.duration,
    userName: video.userName,
    userDislayName: video.userDisplayName,
    creationDate: video.creationDate,
    description: video.description
  };
};

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
