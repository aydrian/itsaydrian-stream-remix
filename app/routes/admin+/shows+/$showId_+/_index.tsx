import { type LoaderArgs, Response, json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "~/components/ui/card";
import { DuplicateEpisodeForm } from "~/routes/resources+/episode-duplicate";
import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { formatDateRange } from "~/utils/misc";

export const loader = async ({ params, request }: LoaderArgs) => {
  await requireUserId(request);
  const { showId } = params;
  const show = await prisma.show.findUnique({
    select: {
      description: true,
      episodes: {
        orderBy: { startDate: "desc" },
        select: { endDate: true, id: true, startDate: true, title: true }
      },
      id: true,
      title: true
    },
    where: { id: showId }
  });
  if (!show) {
    throw new Response("Not Found", {
      status: 404
    });
  }

  return json({ ...show });
};

export default function ShowPage() {
  const { episodes, title } = useLoaderData<typeof loader>();
  return (
    <>
      <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
      <Card className="max-w-fit">
        <CardHeader>
          <CardTitle>Episodes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-start gap-4">
            {episodes.map((episode) => (
              <Card className="max-w-xs" key={episode.id}>
                <CardHeader>
                  <CardTitle>{episode.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  {formatDateRange(episode.startDate, episode.endDate)}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button asChild>
                    <Link to={`./episodes/${episode.id}`}>View</Link>
                  </Button>
                  <DuplicateEpisodeForm episodeId={episode.id} />
                </CardFooter>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
