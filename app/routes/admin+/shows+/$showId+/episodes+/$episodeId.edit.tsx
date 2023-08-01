import { type LoaderArgs, Response } from "@remix-run/node";
import { typedjson, useTypedLoaderData } from "remix-typedjson";

import { EpisodeEditor } from "~/routes/resources+/episode-editor";
import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";

export const loader = async ({ params, request }: LoaderArgs) => {
  await requireUserId(request);
  const { episodeId } = params;
  const episode = await prisma.episode.findUnique({
    select: {
      description: true,
      endDate: true,
      guests: {
        orderBy: { order: "asc" },
        select: { guestId: true, order: true }
      },
      id: true,
      showId: true,
      startDate: true,
      title: true,
      vdoPassword: true
    },
    where: { id: episodeId }
  });
  if (!episode) {
    throw new Response("Not Found", {
      status: 404
    });
  }

  return typedjson({ episode });
};

export const handle = {
  breadcrumb: () => <span>Edit Episode</span>
};

export default function EditEpisode() {
  const { episode } = useTypedLoaderData<typeof loader>();

  return (
    <>
      <h3 className="text-xl font-bold tracking-tight">Edit Episode</h3>
      <EpisodeEditor episode={episode} showId={episode.showId} />
    </>
  );
}
