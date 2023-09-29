import type { LoaderArgs } from "@remix-run/node";

import { json } from "@remix-run/node";
import { Outlet, useLoaderData, useOutletContext } from "@remix-run/react";

import type { ResolvedRemixLoader } from "~/utils/types";

import { Icon } from "~/components/icon";
import { getNextEpisode } from "~/utils/db.server";

export const loader = async ({ request }: LoaderArgs) => {
  const url = new URL(request.url);
  const showGuides = Boolean(url.searchParams.get("showGuides"));
  const nextEpisode = await getNextEpisode("CRL");
  return json({ ...nextEpisode, showGuides });
};

export type OutLetContext = {
  guests: ResolvedRemixLoader<typeof loader>["guests"];
  showGuides: boolean;
};

export default function ScenesLayout() {
  const { guests, show, showGuides, subtitle, title } =
    useLoaderData<typeof loader>();
  return (
    <div className="grid aspect-video h-[1080px] grid-rows-[auto_200px] font-poppins">
      <main className="h-[880px]">
        <Outlet context={{ guests, showGuides }} />
      </main>
      <footer className="animate-gradient-x bg-gradient-to-r from-crl-dark-blue via-crl-electric-purple to-crl-iridescent-blue pt-2">
        <div className="flex h-full justify-between bg-crl-deep-purple px-8 py-4 text-white">
          <div className="flex flex-col text-white">
            <h1 className="mb-1 flex min-w-fit bg-gradient-to-r from-crl-iridescent-blue to-crl-electric-purple bg-clip-text text-6xl font-bold leading-tight text-transparent">
              {show.title}
            </h1>
            <h2 className=" text-4xl font-semibold leading-tight">{title}</h2>
            <h3 className=" text-3xl font-medium leading-tight text-gray-200">
              {subtitle}
            </h3>
          </div>
          <div className="flex flex-col justify-center gap-4">
            <Icon className="h-16 w-auto" name="crl-full-horizontal" />
            <div className="flex items-center justify-center gap-2">
              <Icon className="h-8 w-8" name="github" />
              <Icon className="h-8 w-8" name="instagram" />
              <Icon className="h-8 w-8" name="twitter" />
              <Icon className="h-8 w-8" name="youtube" />
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
