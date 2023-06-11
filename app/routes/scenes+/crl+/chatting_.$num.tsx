import { type LoaderArgs, Response, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import type { EpisodeGuests } from "~/utils/db.server";

import { Twitter } from "~/components/brand-logos";
import { GuestsGrid } from "~/components/guests-grid";

import { useEpisode } from "./_layout";

export const loader = async ({ params }: LoaderArgs) => {
  const num = parseInt(params.num ?? "");

  if (isNaN(num)) {
    throw new Response("Parameter expected to be a number", { status: 400 });
  }

  return json({ num });
};

export default function Chatting() {
  const { num } = useLoaderData<typeof loader>();
  const { guests, showGuides } = useEpisode();
  const slice = guests.slice(0, num);
  return (
    <GuestsGrid Caption={CrlCaption} guests={slice} showGuides={showGuides} />
  );
}

function CrlCaption({ guest }: { guest: EpisodeGuests[number] }) {
  return (
    <figcaption className="absolute bottom-0 left-0 z-10 w-full bg-gradient-to-r from-crl-deep-purple from-40% px-4 py-2">
      <div className="flex w-full flex-col">
        <h1 className="relative z-10 block text-4xl font-semibold text-white">
          {`${guest.firstName} ${guest.lastName}`}
        </h1>
        {guest.title && (
          <h2 className="text-3xl text-crl-neutral-300">{guest.title}</h2>
        )}
        {guest.twitter && (
          <h3 className="text-2xl text-crl-neutral-300">
            <Twitter className="mr-2 inline-block h-6 w-auto" />
            <span>@{guest.twitter}</span>
          </h3>
        )}
      </div>
    </figcaption>
  );
}
