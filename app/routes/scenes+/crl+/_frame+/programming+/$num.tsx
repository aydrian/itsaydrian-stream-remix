import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getParams } from "remix-params-helper";
import { z } from "zod";

import { GuestsGrid } from "~/components/guests-grid";
import { Icon } from "~/components/icon";
import { ScreenContainer } from "~/components/screen-container";
import { useOptions } from "~/routes/scenes+/_layout";
import { useEpisode } from "~/routes/scenes+/crl+/_layout";
import { type EpisodeGuests } from "~/utils/db.server";

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

export default function Programming() {
  const { num } = useLoaderData<typeof loader>();
  const { guests } = useEpisode();
  const { screenSize, showGuides } = useOptions();
  const slice = guests.slice(0, num);
  return (
    // <div className="grid h-full grid-cols-[auto_1408px]">
    <div className="flex h-full w-full">
      <GuestsGrid
        Caption={CrlCompactCaption}
        direction="vertical"
        guests={slice}
        showGuides={showGuides}
      />
      <ScreenContainer screenSize={screenSize} showGuides={showGuides} />
    </div>
  );
}

function CrlCompactCaption({ guest }: { guest: EpisodeGuests[number] }) {
  return (
    <figcaption className="absolute bottom-0 left-0 z-10 w-full bg-crl-deep-purple px-4 pb-[.625rem] pt-2">
      <div className="flex w-full flex-row flex-wrap items-center justify-between">
        <h1 className="relative z-10 block text-3xl font-semibold text-white">
          <span>{guest.firstName}</span>
        </h1>
        {guest.twitter && (
          <h2 className="text-2xl text-crl-neutral-200">
            <Icon className="mr-2 inline-block h-6 w-6" name="twitter" />
            <span>@{guest.twitter}</span>
          </h2>
        )}
      </div>
    </figcaption>
  );
}
