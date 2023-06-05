import type { ActionFunction } from "@remix-run/node";
import type { HelixSchedule, HelixStream, HelixVideo } from "@twurple/api";
import { Response } from "@remix-run/node";
import crypto from "crypto";
import invariant from "tiny-invariant";
import { ApiClient } from "@twurple/api";
import { AppTokenAuthProvider } from "@twurple/auth";
// import { emitter } from "~/utils/emitter.server";

const twitchSigningSecret = process.env.TWITCH_SIGNING_SECRET;
invariant(
  typeof twitchSigningSecret === "string",
  "Be sure to set TWITCH_SIGNING_SECRET"
);

const redirect_uri = process.env.TWITCH_REDIRECT_URI;
invariant(typeof redirect_uri === "string", "TWITCH_REDIRECT_URI must be set");

const twitchUserId = process.env.TWITCH_USER_ID;
invariant(
  typeof twitchUserId === "string",
  "Set TWITCH_USER_ID to the broadcaster user id."
);
export const TWITCH_USER_ID = twitchUserId;

const twitchClientId = process.env.TWITCH_CLIENT_ID;
invariant(typeof twitchClientId === "string", "TWITCH_CLIENT_ID must be set");

const twitchClientSecret = process.env.TWITCH_CLIENT_SECRET;
invariant(
  typeof twitchClientSecret === "string",
  "TWITCH_CLIENT_SECRET must be set"
);

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

export const requestAccessToken = async (
  code: string
): Promise<{
  access_token: string;
  token_type: string;
  scope: string[];
  expires_in: number;
  refresh_token: string;
}> => {
  return fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      client_id: twitchClientId,
      client_secret: twitchClientSecret,
      code: code,
      grant_type: "authorization_code",
      redirect_uri: redirect_uri
    })
  }).then((res) => res.json());
};

export const refreshAccessToken = async (refresh_token: string) => {
  return fetch(`https://id.twitch.tv/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      client_id: twitchClientId,
      client_secret: twitchClientSecret,
      grant_type: "refresh_token",
      refresh_token
    })
  }).then((res) => res.json());
};

export const getUserProfile = async (access_token: string) => {
  const { data } = await fetch(`https://api.twitch.tv/helix/users`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
      "Client-Id": twitchClientId
    }
  }).then((res) => res.json());
  return data[0];
};

export const getUserEventSubSubscriptions = async (
  userId: string
): Promise<
  {
    id: string;
    status: string;
    type: string;
    version: string;
    condition: { broadcaster_user_id: string };
    created_at: string;
    transport: { method: string; callback: string };
    cost: number;
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
        "Client-Id": twitchClientId
      }
    }
  ).then((res) => res.json());
  return data;
};
