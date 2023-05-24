import type { LoaderArgs } from "@remix-run/node";
import { useEffect } from "react";
import { json } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import invariant from "tiny-invariant";
import { getUsersNowPlaying } from "~/utils/spotify.server";

export const loader = async ({ request }: LoaderArgs) => {
  // const url = new URL(request.url);
  // const refreshToken = url.searchParams.get("refreshToken");
  // TODO: Use function to pull from database or session
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;
  invariant(typeof refreshToken === "string", "refreshToken is required");
  const song = await getUsersNowPlaying(refreshToken);

  return json(song);
};

export function NowPlaying() {
  const songFetcher = useFetcher<typeof loader>();

  useEffect(() => {
    songFetcher.load(`/resources/now-playing`);
  }, []);

  useEffect(() => {
    if (!songFetcher.data?.isPlaying) {
      return;
    }
    const delay = songFetcher.data.duration - songFetcher.data.progress;
    const timer = setTimeout(() => {
      songFetcher.load(`/resources/now-playing`);
    }, delay);
    return () => clearTimeout(timer);
  }, [songFetcher.data]);

  if (!songFetcher.data?.isPlaying) {
    //return <div>Nothing is playing</div>;
    return null;
  }

  const albumArt = songFetcher.data.images.find(({ height }) => height === 64);

  return (
    <div className="flex items-center gap-1">
      {albumArt ? (
        <img
          src={albumArt.url}
          alt={`${songFetcher.data.title} - ${songFetcher.data.artist}`}
          className="aspect-square h-[42px] rounded"
        />
      ) : null}
      <div className="flex flex-col">
        <div className="font-bold leading-tight">{songFetcher.data.title}</div>
        <div className="font-xs leading-tight text-gray-300">
          {songFetcher.data.artist}
        </div>
      </div>
    </div>
  );
}
