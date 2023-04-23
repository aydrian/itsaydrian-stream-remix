const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const basic = Buffer.from(`${client_id}:${client_secret}`).toString("base64");
const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;
const NOW_PLAYING_ENDPOINT =
  "https://api.spotify.com/v1/me/player/currently-playing";

const getAccessToken = async (refresh_token: string) => {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token
    })
  });

  return response.json();
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

export const getUsersNowPlaying = async (refresh_token: string) => {
  const { access_token } = await getAccessToken(refresh_token);
  const response = await fetch(NOW_PLAYING_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${access_token}`
    }
  }).then((res) => res.json());

  const song = {
    title: response.item.name,
    artist: response.item.artists[0].name,
    album: response.item.album.name,
    duration: response.item.duration_ms,
    progress: response.progress_ms,
    images: response.item.album.images,
    isPlaying: response.is_playing
  } as Song;
  return song;
};
