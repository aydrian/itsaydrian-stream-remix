import { createCookie } from "@remix-run/node";

export const redirectToCookie = createCookie("redirect-to", {
  httpOnly: true,
  maxAge: 60, // 1 minute because it makes no sense to keep it for a long time
  path: "/",
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production"
});

export const spotifyStateCookie = createCookie("spotify-auth-state", {
  httpOnly: true,
  maxAge: 60, // 1 minute because it makes no sense to keep it for a long time
  path: "/",
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production"
});

export const nowPlayingCookie = createCookie("now-playing", {
  httpOnly: true,
  path: "/",
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production"
});

export const twitchStateCookie = createCookie("twitch-auth-state", {
  httpOnly: true,
  maxAge: 60, // 1 minute because it makes no sense to keep it for a long time
  path: "/",
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production"
});
