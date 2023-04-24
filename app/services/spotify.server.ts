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
  });

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
