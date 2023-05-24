import { json } from "@remix-run/node";
import { Outlet, useLoaderData, useOutletContext } from "@remix-run/react";

export const loader = async () => {
  return json({
    guests: [
      { name: "Aydrian", twitter: "itsaydrian", title: "Developer Advocate" },
      { name: "Rob", twitter: "robreid_io", title: "Technical Evangelist" }
      // { name: "Atticus", title: "Chief Woof Officer" }
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
    <div className="grid aspect-video h-[1080px] grid-rows-[auto_200px]">
      <main className="h-[880px]">
        <Outlet context={{ guests }} />
      </main>
      <footer className="flex flex-col bg-crl-deep-purple p-3 text-white">
        <h1 className="mb-1 flex bg-gradient-to-r from-crl-iridescent-blue to-crl-electric-purple bg-clip-text text-6xl font-bold leading-tight text-transparent">
          Untitled Rob & Aydrian CockrochDB Show
        </h1>
        {/* <h2 className=" text-4xl font-semibold">[ Title of Stream ]</h2> */}
      </footer>
    </div>
  );
}

export function useEpisode() {
  return useOutletContext<OutLetContext>();
}
