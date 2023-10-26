import { Outlet } from "@remix-run/react";

import { NowPlaying } from "~/routes/resources+/spotify+/now-playing";
import { useEpisode } from "~/routes/scenes+/me+/_layout";

export default function MeFramesLayout() {
  const { show, title } = useEpisode();
  return (
    <div className="grid aspect-video h-[1080px] grid-rows-[50px_auto_150px]">
      <header className="flex items-center justify-between bg-blue-950 px-3 text-white">
        <h1 className="max-w-fit bg-gradient-to-r from-cyan-500 to-green-500 bg-clip-text text-2xl font-bold leading-tight text-transparent">
          ItsAydrian Stream
        </h1>
        <NowPlaying />
      </header>
      <main className="h-[880px]">
        <Outlet />
      </main>
      <footer className="animate-gradient-x bg-gradient-to-r from-blue-950 via-cyan-500 to-green-500 pt-2">
        <div className="flex h-full flex-col bg-blue-950 px-8 py-1.5 text-white">
          <h1 className="mb-1 max-w-fit bg-gradient-to-r from-cyan-500 to-green-500 bg-clip-text text-6xl font-bold leading-tight text-transparent">
            {show.title}
          </h1>
          <h2 className=" text-4xl font-semibold">{title}</h2>
        </div>
      </footer>
    </div>
  );
}
