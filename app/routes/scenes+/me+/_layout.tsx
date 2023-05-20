import { Outlet } from "@remix-run/react";
import { NowPlaying } from "~/routes/resources+/now-playing";

export default function ScenesLayout() {
  return (
    <div className="relative grid grid-rows-[50px_auto_150px]">
      <header className="flex items-center justify-between bg-blue-950 px-3 text-white">
        <h1 className="bg-gradient-to-r from-cyan-500 to-green-500 bg-clip-text text-2xl font-bold leading-tight text-transparent">
          ItsAydrian Stream
        </h1>
        <NowPlaying />
      </header>
      <main className="z-10 flex items-center justify-center gap-0">
        <Outlet />
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
