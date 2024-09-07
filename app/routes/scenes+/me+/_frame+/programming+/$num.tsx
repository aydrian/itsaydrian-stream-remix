import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getParams } from "remix-params-helper";
import { z } from "zod";

import { GuestsGrid } from "~/components/guests-grid";
import { useOptions } from "~/routes/scenes+/_layout";
import { CompactCaption, useEpisode } from "~/routes/scenes+/me+/_layout";

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
