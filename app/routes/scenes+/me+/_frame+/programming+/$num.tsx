import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { GuestsGrid } from "~/components/guests-grid";
import {
  CompactCaption,
  useEpisode,
  useOptions
} from "~/routes/scenes+/me+/_layout";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const num = parseInt(params.num ?? "");

  if (isNaN(num)) {
    throw new Response("Parameter expected to be a number", { status: 400 });
  }

  return json({ num });
};

export default function Programming() {
  const { num } = useLoaderData<typeof loader>();
  const { guests } = useEpisode();
  const { showGuides } = useOptions();
  const slice = guests.slice(0, num);

  return (
    <GuestsGrid
      Caption={CompactCaption}
      direction="vertical"
      guests={slice}
      showGuides={showGuides}
    />
  );
}
