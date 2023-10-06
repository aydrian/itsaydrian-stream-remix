import type { LoaderFunctionArgs } from "@remix-run/node";

import { useEventSource } from "remix-utils/sse/react";
import { eventStream } from "remix-utils/sse/server";
import invariant from "tiny-invariant";

import type { Song } from "~/utils/spotify.server";

import { nowPlayingCookie } from "~/utils/cookies.server";
import { getUsersNowPlaying } from "~/utils/spotify.server";

const sleep = (ms: number) => new Promise((_) => setTimeout(_, ms));

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const cookie = await nowPlayingCookie.parse(request.headers.get("Cookie"));

  return eventStream(request.signal, function setup(send) {
    const refreshToken = cookie?.refreshToken;
    invariant(typeof refreshToken === "string", "refreshToken is required");
    let polling = true;

    (async function doPolling() {
      while (polling) {
        let song = await getUsersNowPlaying(refreshToken);
        if (!song.isPlaying) {
          polling = false;
          break;
        }
        send({ data: JSON.stringify(song), event: "now-playing" });
        await sleep(song.duration - song.progress);
      }
    })();

    return function clear() {
      polling = false;
    };
  });
};

export function NowPlaying() {
  const songEvent = useEventSource("/resources/spotify/now-playing", {
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
          alt={`${song.title} - ${song.artist}`}
          className="aspect-square h-[42px] rounded"
          src={albumArt.url}
        />
      ) : null}
      <div className="flex flex-col">
        <div className="font-bold leading-tight">{song.title}</div>
        <div className="font-xs leading-tight text-gray-300">{song.artist}</div>
      </div>
    </div>
  );
}
