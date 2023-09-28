import { type LoaderArgs, json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
  const episodes = await prisma.episode.findMany({
    orderBy: { startDate: "desc" },
    select: {
      description: true,
      endDate: true,
      guests: {
        orderBy: { order: "asc" },
        select: {
          guest: {
            select: {
              firstName: true,
              id: true,
              lastName: true,
              twitter: true
            }
          },
          order: true
        }
      },
      id: true,
      startDate: true,
      title: true
    },
    where: { showId }
  });

  return json({ episodes });
};

export default function EpisodesIndex() {
  const { episodes } = useLoaderData<typeof loader>();

  return (
    <>
      <Card className="max-w-fit">
        <CardHeader>
          <CardTitle>Episodes</CardTitle>
        </CardHeader>
        <CardContent>
          {episodes ? (
            <div className="flex flex-wrap justify-start gap-4">
              {episodes.map((episode) => {
                const [host, ...guests] = episode.guests;
                return (
                  <Card className="max-w-xs" key={episode.id}>
                    <CardHeader>
                      <CardTitle>{episode.title}</CardTitle>
                      <CardDescription>
                        {formatDateRange(episode.startDate, episode.endDate)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div>{episode.description}</div>
                      <div>
                        <div className="font-semibold">
                          Host:{" "}
                          {`${host.guest.firstName} ${host.guest.lastName}`}
                        </div>
                        <div className="font-semibold">
                          Guests:{" "}
                          {guests.map(({ guest }, index) => (
                            <span key={guest.id}>
                              {`${guest.firstName} ${guest.lastName}${
                                index !== guests.length - 1 ? ", " : ""
                              }`}
                            </span>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                      <Button asChild size="sm">
                        <Link to={`./${episode.id}`}>View</Link>
                      </Button>
                      <DuplicateEpisodeForm episodeId={episode.id} />
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div>This show has no episodes</div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
