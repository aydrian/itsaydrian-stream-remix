import { type LoaderArgs, Response, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { EpisodeEditor } from "~/routes/resources+/episode-editor";
import { requireUser } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";

export const loader = async ({ params, request }: LoaderArgs) => {
  await requireUser(request);
  const { episodeId } = params;
  const episode = await prisma.episode.findUnique({
    where: { id: episodeId },
    select: {
      id: true,
      showId: true,
      startDate: true,
      endDate: true,
      title: true,
      description: true,
      vdoPassword: true,
      guests: { select: { order: true, guestId: true } }
    }
  });
  if (!episode) {
    throw new Response("Not Found", {
      status: 404
    });
  }
  return json({ episode });
};

export default function EditEpisode() {
  const { episode } = useLoaderData<typeof loader>();

  return (
    <>
      <h2 className="text-3xl font-bold tracking-tight">Edit Episode</h2>
      <EpisodeEditor episode={episode} showId={episode.showId} />
    </>
  );
}
