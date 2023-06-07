import { type LoaderArgs, json, Response } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "~/components/ui/card";
import { DuplicateEpisodeForm } from "~/routes/resources+/episode-duplicate";
import { requireUser } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { formatDateRange } from "~/utils/misc";
import { Button } from "~/components/ui/button";

export const loader = async ({ params, request }: LoaderArgs) => {
  await requireUser(request);
  const { showId } = params;
  const show = await prisma.show.findUnique({
    where: { id: showId },
    select: {
      id: true,
      title: true,
      description: true,
      episodes: {
        select: { id: true, startDate: true, endDate: true, title: true },
        orderBy: { startDate: "desc" }
      }
    }
  });
  if (!show) {
    throw new Response("Not Found", {
      status: 404
    });
  }

  return json({ ...show });
};

export default function ShowPage() {
  const { title, episodes } = useLoaderData<typeof loader>();
  return (
    <>
      <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
      <Card>
        <CardHeader>
          <CardTitle>Episodes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-start gap-4">
            {episodes.map((episode) => (
              <Card key={episode.id} className="max-w-xs">
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
