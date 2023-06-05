import env from "~/utils/env.server";

const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REDIRECT_URI } = env;

const basic = Buffer.from(
  `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
).toString("base64");

export const requestAccessToken = async (
  code: string
): Promise<{
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  refresh_token: string;
}> => {
  return fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      code: code,
      redirect_uri: SPOTIFY_REDIRECT_URI,
      grant_type: "authorization_code"
    })
  }).then((res) => res.json());
};

const refreshAccessToken = async (refresh_token: string) => {
  return fetch(`https://accounts.spotify.com/api/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token
    })
  }).then((res) => res.json());
};

type SongImage = {
  height: number;
  width: number;
  url: string;
};

export type Song = {
  title: string;
  artist: string;
  album: string;
  duration: number;
  progress: number;
  images: Array<SongImage>;
  isPlaying: boolean;
};

export const getUserProfile = async (access_token: string) => {
  return fetch(`https://api.spotify.com/v1/me`, {
    headers: {
      Authorization: `Bearer ${access_token}`
    }
  }).then((res) => res.json());
};

export const getUsersNowPlaying = async (refresh_token: string) => {
  const { access_token } = await refreshAccessToken(refresh_token);
  const response = await fetch(
    `https://api.spotify.com/v1/me/player/currently-playing`,
    {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    }
  );

  // Handle device being off
  if (response.status === 204) {
    const noSong = {
      title: "",
      artist: "",
      album: "",
      duration: 0,
      isPlaying: false,
      progress: 0,
      images: []
    } as Song;
    return noSong;
  }

  const data = await response.json();

  const song = {
    title: data.item.name,
    artist: data.item.artists[0].name,
    album: data.item.album.name,
    duration: data.item.duration_ms,
    progress: data.progress_ms,
    images: data.item.album.images,
    isPlaying: data.is_playing
  } as Song;
  return song;
};
