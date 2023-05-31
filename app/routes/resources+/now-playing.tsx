import type { LoaderArgs } from "@remix-run/node";
import type { Song } from "~/utils/spotify.server";
import { eventStream } from "remix-utils";
import invariant from "tiny-invariant";
import { getUsersNowPlaying } from "~/utils/spotify.server";
import { useEventSource } from "remix-utils";

const sleep = (ms: number) => new Promise((_) => setTimeout(_, ms));

export const loader = async ({ request }: LoaderArgs) => {
  return eventStream(request.signal, function setup(send) {
    const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;
    invariant(typeof refreshToken === "string", "refreshToken is required");
    let polling = true;

    (async function doPolling() {
      while (polling) {
        let song = await getUsersNowPlaying(refreshToken);
        if (!song.isPlaying) {
          polling = false;
          break;
        }
        send({ event: "now-playing", data: JSON.stringify(song) });
        await sleep(song.duration - song.progress);
      }
    })();

    return function clear() {
      polling = false;
    };
  });
};

export function NowPlaying() {
  const songEvent = useEventSource("/resources/now-playing", {
    event: "now-playing"
  });
  const song = songEvent ? (JSON.parse(songEvent) as Song) : undefined;

  if (!song?.isPlaying) {
    return null;
  }

  const albumArt = song.images?.find(({ height }) => height === 64);

  return (
    <div className="flex items-center gap-1 font-atkinson-hyperlegible">
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
