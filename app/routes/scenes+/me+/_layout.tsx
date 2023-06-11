import type { LoaderArgs } from "@remix-run/node";

import { json } from "@remix-run/node";
import { Outlet, useLoaderData, useOutletContext } from "@remix-run/react";

import type { ResolvedRemixLoader } from "~/utils/types";

import { NowPlaying } from "~/routes/resources+/spotify+/now-playing";
import { nowPlayingCookie } from "~/utils/cookies.server";
import { getNextEpisode, prisma } from "~/utils/db.server";

export const loader = async ({ request }: LoaderArgs) => {
  const url = new URL(request.url);
  const showGuides = Boolean(url.searchParams.get("showGuides"));
  const [nextEpisode, spotifyConnection] = await Promise.all([
    getNextEpisode("ME"),
    prisma.connection.findUnique({
      select: {
        accessToken: true,
        expiresAt: true,
        id: true,
        refreshToken: true
      },
      where: { id: "6a003ecf-8f0b-44d4-a943-ba97649587d2" }
    })
  ]);

  return json(
    { ...nextEpisode, showGuides },
    {
      headers: {
        "Set-Cookie": await nowPlayingCookie.serialize(spotifyConnection)
      }
    }
  );
};

export type OutLetContext = {
  guests: ResolvedRemixLoader<typeof loader>["guests"];
  showGuides: boolean;
};

export default function ScenesLayout() {
  const { guests, showGuides, title } = useLoaderData<typeof loader>();
  return (
    <div className="grid aspect-video h-[1080px] grid-rows-[50px_auto_150px]">
      <header className="flex items-center justify-between bg-blue-950 px-3 text-white">
        <h1 className="max-w-fit bg-gradient-to-r from-cyan-500 to-green-500 bg-clip-text text-2xl font-bold leading-tight text-transparent">
          ItsAydrian Stream
        </h1>
        <NowPlaying />
      </header>
      <main className="h-[880px]">
        <Outlet context={{ guests, showGuides }} />
      </main>
      <footer className="animate-gradient-x bg-gradient-to-r from-blue-950 via-cyan-500 to-green-500 pt-2">
        <div className="flex h-full flex-col bg-blue-950 px-8 py-1.5 text-white">
          <h1 className="mb-1 max-w-fit bg-gradient-to-r from-cyan-500 to-green-500 bg-clip-text text-6xl font-bold leading-tight text-transparent">
            Casual Coding
          </h1>
          <h2 className=" text-4xl font-semibold">{title}</h2>
        </div>
      </footer>
    </div>
  );
}

export function useEpisode() {
  return useOutletContext<OutLetContext>();
}
