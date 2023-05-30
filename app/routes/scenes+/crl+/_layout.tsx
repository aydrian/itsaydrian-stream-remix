import type { ResolvedRemixLoader } from "~/utils/types";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData, useOutletContext } from "@remix-run/react";
import { getNextEpisode } from "~/utils/db.server";
import * as CrlLogo from "~/components/cockroach-labs-logos";
import { GitHub, Instagram, Twitter, YouTube } from "~/components/brand-logos";

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
    <div className="grid aspect-video h-[1080px] grid-rows-[auto_200px] font-poppins">
      <main className="h-[880px]">
        <Outlet context={{ guests: Guests, showGuides }} />
      </main>
      <footer className="animate-gradient-x bg-gradient-to-r from-crl-dark-blue via-crl-electric-purple to-crl-iridescent-blue pt-2">
        <div className="flex h-full justify-between bg-crl-deep-purple px-8 py-4 text-white">
          <div className="flex flex-col text-white">
            <h1 className="mb-1 flex min-w-fit bg-gradient-to-r from-crl-iridescent-blue to-crl-electric-purple bg-clip-text text-6xl font-bold leading-tight text-transparent">
              {Show.title}
            </h1>
            <h2 className=" text-4xl font-semibold">{title}</h2>
          </div>
          <div className="flex flex-col justify-center gap-4">
            <CrlLogo.FullHorizontal className="h-16 w-auto" />
            <div className="flex items-center justify-center gap-2">
              <GitHub className="h-8 w-auto" />
              <Instagram className="h-8 w-auto" />
              <Twitter className="h-8 w-auto" />
              <YouTube className="h-8 w-auto" />
              <span className="text-4xl font-semibold">@cockroachdb</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function useEpisode() {
  return useOutletContext<OutLetContext>();
}
