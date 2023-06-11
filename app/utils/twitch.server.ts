import type { ActionFunction } from "@remix-run/node";
import type { HelixSchedule, HelixStream, HelixVideo } from "@twurple/api";

import { Response } from "@remix-run/node";
import { ApiClient } from "@twurple/api";
import { AppTokenAuthProvider } from "@twurple/auth";
import crypto from "crypto";
import invariant from "tiny-invariant";

// import { emitter } from "~/utils/emitter.server";
import env from "~/utils/env.server";

const {
  TWITCH_CLIENT_ID,
  TWITCH_CLIENT_SECRET,
  TWITCH_REDIRECT_URI,
  TWITCH_SIGNING_SECRET
} = env;

export const scheduleToJSON = (schedule: HelixSchedule | null) => {
  if (!schedule) return null;
  const segments = schedule.segments.map((segment) => {
    return {
      categoryName: segment.categoryName,
      endDate: segment.endDate,
      id: segment.id,
      isRecurring: segment.isRecurring,
      startDate: segment.startDate,
      title: segment.title
    };
  });
  return {
    broadcasterDisplayName: schedule.broadcasterDisplayName,
    broadcasterName: schedule.broadcasterName,
    segments,
    vacationEndDate: schedule.vacationEndDate,
    vacationStartDate: schedule.vacationStartDate
  };
};

export const streamToJSON = async (stream: HelixStream | null) => {
  if (!stream) return null;
  const game = await stream.getGame();
  return {
    gameBoxArtUrl: game?.boxArtUrl,
    gameName: game?.name,
    thumbnailUrl: stream.thumbnailUrl,
    title: stream.title,
    userDislayName: stream.userDisplayName,
    userName: stream.userName
  };
};

export const videoToJSON = (video: HelixVideo | null) => {
  if (!video) return null;
  return {
    creationDate: video.creationDate,
    description: video.description,
    duration: video.duration,
    thumbnailUrl: video.thumbnailUrl,
    title: video.title,
    url: video.url,
    userDislayName: video.userDisplayName,
    userName: video.userName
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

    if (!TWITCH_CLIENT_SECRET) {
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
        .createHmac("sha256", TWITCH_SIGNING_SECRET)
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
  TWITCH_CLIENT_ID,
  TWITCH_CLIENT_SECRET
);

export const twitch = new ApiClient({ authProvider });

export interface EventSubEvent {
  user_id: string;
}

export const requestAccessToken = async (
  code: string
): Promise<{
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string[];
  token_type: string;
}> => {
  return fetch("https://id.twitch.tv/oauth2/token", {
    body: new URLSearchParams({
      client_id: TWITCH_CLIENT_ID,
      client_secret: TWITCH_CLIENT_SECRET,
      code: code,
      grant_type: "authorization_code",
      redirect_uri: TWITCH_REDIRECT_URI
    }),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    method: "POST"
  }).then((res) => res.json());
};

export const refreshAccessToken = async (refresh_token: string) => {
  return fetch(`https://id.twitch.tv/oauth2/token`, {
    body: new URLSearchParams({
      client_id: TWITCH_CLIENT_ID,
      client_secret: TWITCH_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token
    }),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    method: "POST"
  }).then((res) => res.json());
};

export const getUserProfile = async (access_token: string) => {
  const { data } = await fetch(`https://api.twitch.tv/helix/users`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
      "Client-Id": TWITCH_CLIENT_ID
    }
  }).then((res) => res.json());
  return data[0];
};

export const getUserEventSubSubscriptions = async (
  userId: string
): Promise<
  {
    condition: { broadcaster_user_id: string };
    cost: number;
    created_at: string;
    id: string;
    status: string;
    transport: { callback: string; method: string };
    type: string;
    version: string;
  }[]
> => {
  const auth = await authProvider.getAppAccessToken();
  const { data } = await fetch(
    `https://api.twitch.tv/helix/eventsub/subscriptions?${new URLSearchParams({
      user_id: userId
    })}`,
    {
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
        "Client-Id": TWITCH_CLIENT_ID
      }
    }
  ).then((res) => res.json());
  return data;
};
