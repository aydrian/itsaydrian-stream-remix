import type { LoaderArgs } from "@remix-run/node";
import type { Song } from "~/services/spotify.server";
import { useEffect, useState } from "react";
import { json } from "@remix-run/node";
import invariant from "tiny-invariant";
import { getUsersNowPlaying } from "~/services/spotify.server";

export const loader = async ({ request }: LoaderArgs) => {
  // const url = new URL(request.url);
  // const refreshToken = url.searchParams.get("refreshToken");
  // TODO: Use function to pull from database or session
  const refreshToken =
    "AQCToFbIL0uzDrFo6_H8UnmuwZkwuO1G9LPGtuM7DjSwfXUxzu2ZiH6c07jWi-EPoJOrrEo_1TFUq8s2Pzots84zCM6DY1XAxA0ybmmunbLvylGdWR0JUCcsTSciV26rJ9M";
  invariant(typeof refreshToken === "string", "refreshToken is required");
  const song = await getUsersNowPlaying(refreshToken);

  return json(song);
};

export function NowPlaying() {
  const [song, setSong] = useState<Song>({
    title: "",
    artist: "",
    album: "",
    duration: 0,
    isPlaying: true,
    progress: 0,
    images: []
  });

  useEffect(() => {
    if (!song.isPlaying) {
      return;
    }

    const delay = song.duration - song.progress;

    const timer = setTimeout(() => {
      fetch(`/resources/now-playing`)
        .then((res) => res.json())
        .then((song) => setSong(song));
    }, delay);
    return () => clearTimeout(timer);
  }, [song]);

  if (!song.isPlaying) {
    //return <div>Nothing is playing</div>;
    return null;
  }

  const albumArt = song.images.find(({ height }) => height === 64);

  return (
    <div className="flex items-center gap-1">
      {albumArt ? (
        <img
          src={albumArt.url}
          alt={`${song.title} - ${song.artist}`}
          className="aspect-square h-[42px] rounded"
        />
      ) : null}
      <div className="flex flex-col">
        <div className="font-bold leading-tight">{song.title}</div>
        <div className="font-xs leading-tight text-gray-300">{song.artist}</div>
      </div>
    </div>
  );
}
