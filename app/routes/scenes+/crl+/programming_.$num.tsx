import type { EpisodeGuests } from "~/utils/db.server";
import { type LoaderArgs, Response, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEpisode } from "./_layout";
import { GuestsGrid } from "~/components/guests-grid";
import { ScreenContainer } from "~/components/screen-container";
import { Twitter } from "~/components/brand-logos";

export const loader = async ({ params }: LoaderArgs) => {
  const num = parseInt(params.num ?? "");

  if (isNaN(num)) {
    throw new Response("Parameter expected to be a number", { status: 400 });
  }

  return json({ num });
};

export default function Programming() {
  const { num } = useLoaderData<typeof loader>();
  const { guests, showGuides } = useEpisode();
  const slice = guests.slice(0, num);
  return (
    <div className="grid h-full grid-cols-[auto_1408px]">
      <GuestsGrid
        guests={slice}
        direction="vertical"
        showGuides={showGuides}
        Caption={CrlCompactCaption}
      />
      <ScreenContainer showGuides={showGuides} />
    </div>
  );
}

function CrlCompactCaption({ guest }: { guest: EpisodeGuests[number] }) {
  return (
    <figcaption className="absolute bottom-0 left-0 z-10 w-full bg-crl-deep-purple px-4 pb-[.625rem] pt-2">
      <div className="flex w-full flex-row items-baseline justify-between">
        <h1 className="relative z-10 block text-3xl font-semibold text-white">
          <span>{guest.firstName}</span>
        </h1>
        {guest.twitter && (
          <h2 className="text-2xl text-crl-neutral-200">
            <Twitter className="mr-2 inline-block h-6 w-auto" />
            <span>@{guest.twitter}</span>
          </h2>
        )}
      </div>
    </figcaption>
  );
}
