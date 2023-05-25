import type { ResolvedRemixLoader } from "~/utils/types";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData, useOutletContext } from "@remix-run/react";
import { getNextEpisode } from "~/utils/db.server";

export const loader = async ({ request }: LoaderArgs) => {
  const url = new URL(request.url);
  const showGuides = Boolean(url.searchParams.get("showGuides"));
  const nextEpisode = await getNextEpisode("CRL");
  return json({ ...nextEpisode, showGuides });
};

export type OutLetContext = {
  guests: ResolvedRemixLoader<typeof loader>["Guests"];
  showGuides: boolean;
};

export default function ScenesLayout() {
  const { Guests, Show, showGuides, title } = useLoaderData<typeof loader>();
  return (
    <div className="grid aspect-video h-[1080px] grid-rows-[auto_200px]">
      <main className="h-[880px]">
        <Outlet context={{ guests: Guests, showGuides }} />
      </main>
      <footer className="flex flex-col bg-crl-deep-purple p-3 text-white">
        <h1 className="mb-1 flex max-w-fit bg-gradient-to-r from-crl-iridescent-blue to-crl-electric-purple bg-clip-text text-6xl font-bold leading-tight text-transparent">
          {Show.title}
        </h1>
        <h2 className=" text-4xl font-semibold">{title}</h2>
      </footer>
    </div>
  );
}

export function useEpisode() {
  return useOutletContext<OutLetContext>();
}
