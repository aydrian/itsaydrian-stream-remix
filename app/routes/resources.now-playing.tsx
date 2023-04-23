import type { LoaderArgs } from "@remix-run/node";
import type { Song } from "~/services/spotify.server";
import { useEffect, useState } from "react";
import { json } from "@remix-run/node";
import invariant from "tiny-invariant";
import { getUsersNowPlaying } from "~/services/spotify.server";

export const loader = async ({ request }: LoaderArgs) => {
  const url = new URL(request.url);
  const refreshToken = url.searchParams.get("refreshToken");
  invariant(typeof refreshToken === "string", "refreshToken is required");
  const song = await getUsersNowPlaying(refreshToken);

  return json(song);
};

export function NowPlaying({ refreshToken }: { refreshToken: string }) {
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
      fetch(`/resources/now-playing?refreshToken=${refreshToken}`)
        .then((res) => res.json())
        .then((song) => setSong(song));
    }, delay);
    return () => clearTimeout(timer);
  }, [song, refreshToken]);

  if (!song.isPlaying) {
    return <div>Nothing is playing</div>;
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
