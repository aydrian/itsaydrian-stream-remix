import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getParams } from "remix-params-helper";
import { z } from "zod";

import type { EpisodeGuests } from "~/utils/db.server";

import { GuestsGrid } from "~/components/guests-grid";
import { Icon } from "~/components/icon";
import { useOptions } from "~/routes/scenes+/_layout";
import { useEpisode } from "~/routes/scenes+/crl+/_layout";

const ParamsSchema = z.object({
  num: z.number().optional()
});

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const result = getParams(params, ParamsSchema);
  if (!result.success) {
    throw json(result.errors, { status: 400 });
  }
  const num = result.data.num;

  return json({ num });
};

export default function Chatting() {
  const { num } = useLoaderData<typeof loader>();
  const { guests } = useEpisode();
  const { showGuides } = useOptions();
  const slice = guests.slice(0, num);

  return (
    <GuestsGrid
      Caption={slice.length === 6 ? CrlCompactCaption : CrlCaption}
      guests={slice}
      showGuides={showGuides}
    />
  );
}

function CrlCompactCaption({ guest }: { guest: EpisodeGuests[number] }) {
  return (
    <figcaption className="absolute bottom-0 left-0 z-10 w-full bg-gradient-to-r from-crl-deep-purple from-40% px-4 py-2">
      <div className="flex w-full flex-col">
        <h1 className="relative z-10 block text-3xl font-semibold text-white">
          {`${guest.firstName} ${guest.lastName}`}
        </h1>
        <div className="flex gap-4">
          {guest.title && (
            <h2 className="text-2xl text-crl-neutral-300">{guest.title}</h2>
          )}
          {guest.twitter && (
            <h3 className="text-xl text-crl-neutral-300">
              <Icon className="mr-1 inline-block h-4 w-4" name="twitter" />
              <span>@{guest.twitter}</span>
            </h3>
          )}
        </div>
      </div>
    </figcaption>
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
            <Icon className="mr-1 inline-block h-6 w-6" name="twitter" />
            <span>@{guest.twitter}</span>
          </h3>
        )}
      </div>
    </figcaption>
  );
}
