import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import atticusAndMe from "~/images/atticus-and-me.png";
import { getNextEpisode } from "~/utils/db.server";

export const loader = async () => {
  const nextEpisode = await getNextEpisode("ME");
  return json(nextEpisode);
};

export default function StartingSoon() {
  const { show, title } = useLoaderData<typeof loader>();
  return (
    <div className="flex h-screen w-screen items-center justify-between bg-blue-950 text-white">
      <div className="h-full grow bg-gradient-to-r from-cyan-500 to-green-500 p-8">
        <div className="flex h-full w-full items-center justify-center">
          <div className="flex h-full grow flex-col items-center justify-center rounded-lg bg-blue-950 bg-opacity-75 shadow">
            <div className="flex h-full grow flex-col items-center justify-center gap-1.5">
              <h1 className="max-w-fit bg-gradient-to-r from-cyan-500 to-green-500 bg-clip-text text-center text-9xl font-bold leading-tight text-transparent">
                {show.title}
              </h1>
              <h2 className="text-center text-7xl font-semibold leading-tight">
                {title}
              </h2>
            </div>
            <h2 className="max-w-fit animate-pulse bg-gradient-to-r from-cyan-500 to-green-500 bg-clip-text p-8 text-7xl font-bold leading-tight text-transparent">
              Starting Soon...
            </h2>
          </div>
        </div>
      </div>
      <img alt="Atticus and Me" height="1080" src={atticusAndMe} width="810" />
    </div>
  );
}
