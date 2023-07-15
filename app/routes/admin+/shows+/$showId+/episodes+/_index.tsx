import { type LoaderArgs, json } from "@remix-run/node";
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
      episodes: {
        orderBy: { startDate: "desc" },
        select: {
          endDate: true,
          id: true,
          startDate: true,
          title: true
        }
      },
      id: true,
      title: true
    },
    where: { id: showId }
  });

  return json({ ...show });
};

export default function EpisodesIndex() {
  const { episodes } = useLoaderData<typeof loader>();

  return (
    <Card className="max-w-fit">
      <CardHeader>
        <CardTitle>Episodes</CardTitle>
      </CardHeader>
      <CardContent>
        {episodes ? (
          <div className="flex flex-wrap justify-start gap-4">
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
                    <Link to={`./${episode.id}`}>View</Link>
                  </Button>
                  <DuplicateEpisodeForm episodeId={episode.id} />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div>This show has not eposides</div>
        )}
      </CardContent>
    </Card>
  );
}
