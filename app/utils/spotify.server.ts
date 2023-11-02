const basic = Buffer.from(
  `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
).toString("base64");

export const requestAccessToken = async (
  code: string
): Promise<{
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  token_type: string;
}> => {
  return fetch("https://accounts.spotify.com/api/token", {
    body: new URLSearchParams({
      code: code,
      grant_type: "authorization_code",
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI
    }),
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    method: "POST"
  }).then((res) => res.json());
};

const refreshAccessToken = async (refresh_token: string) => {
  return fetch(`https://accounts.spotify.com/api/token`, {
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token
    }),
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    method: "POST"
  }).then((res) => res.json());
};

type SongImage = {
  height: number;
  url: string;
  width: number;
};

export type Song = {
  album: string;
  artist: string;
  duration: number;
  images: Array<SongImage>;
  isPlaying: boolean;
  progress: number;
  title: string;
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
      album: "",
      artist: "",
      duration: 0,
      images: [],
      isPlaying: false,
      progress: 0,
      title: ""
    } as Song;
    return noSong;
  }

  const data = await response.json();

  const song = {
    album: data.item.album.name,
    artist: data.item.artists[0].name,
    duration: data.item.duration_ms,
    images: data.item.album.images,
    isPlaying: data.is_playing,
    progress: data.progress_ms,
    title: data.item.name
  } as Song;
  return song;
};
