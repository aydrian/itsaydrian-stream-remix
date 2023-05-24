import { json } from "@remix-run/node";
import { Outlet, useLoaderData, useOutletContext } from "@remix-run/react";
import { NowPlaying } from "~/routes/resources+/now-playing";

export const loader = async () => {
  return json({
    guests: [
      { name: "Aydrian", twitter: "itsaydrian", title: "Developer Advocate" },
      { name: "Atticus", title: "Chief Woof Officer" }
      // { name: "Otto", title: "Chief Woof Officer" }
      // { name: "Barry", title: "Chief Woof Officer" }
      // { name: "Barry", title: "Chief Woof Officer" }
    ]
  });
};

export type OutLetContext = {
  guests: { name: string; twitter?: string; title?: string }[];
};

export default function ScenesLayout() {
  const { guests } = useLoaderData<typeof loader>();
  return (
    <div className="grid aspect-video h-[1080px] grid-rows-[50px_auto_150px]">
      <header className="flex items-center justify-between bg-blue-950 px-3 text-white">
        <h1 className="bg-gradient-to-r from-cyan-500 to-green-500 bg-clip-text text-2xl font-bold leading-tight text-transparent">
          ItsAydrian Stream
        </h1>
        <NowPlaying />
      </header>
      <main className="h-[880px]">
        <Outlet context={{ guests }} />
      </main>
      <footer className="flex flex-col bg-blue-950 p-3 text-white">
        <h1 className="mb-1 bg-gradient-to-r from-cyan-500 to-green-500 bg-clip-text text-6xl font-bold leading-tight text-transparent">
          Casual Coding
        </h1>
        {/* <h2 className=" text-4xl font-semibold">[ Title of Stream ]</h2> */}
      </footer>
    </div>
  );
}

export function useEpisode() {
  return useOutletContext<OutLetContext>();
}
