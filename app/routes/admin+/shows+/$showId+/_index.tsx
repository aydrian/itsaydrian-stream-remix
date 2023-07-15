import { type LoaderArgs, Response, json } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "~/components/ui/card";
import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { formatDateRange } from "~/utils/misc";

export const loader = async ({ params, request }: LoaderArgs) => {
  await requireUserId(request);
  const { showId } = params;
  const show = await prisma.show.findUnique({
    select: {
      episodes: {
        orderBy: { startDate: "asc" },
        select: {
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
        where: { startDate: { gte: new Date() } }
      },
      id: true
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

export default function ShowIndex() {
  const { episodes } = useLoaderData<typeof loader>();
  return (
    <>
      <Outlet />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Upcoming Episodes</CardTitle>
          <Link className="text-sm font-medium text-blue-700" to="./episodes">
            View All
          </Link>
        </CardHeader>
        <CardContent>
          {episodes.length ? (
            <div className="flex flex-wrap gap-4">
              {episodes.map((episode) => (
                <Card key={episode.id}>
                  <CardHeader>
                    <CardTitle>{episode.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      {formatDateRange(episode.startDate, episode.endDate)}
                    </div>
                    <div>
                      <span className="font-semibold">Guests: </span>
                      {episode.guests.map(({ guest }, index) => (
                        <span key={guest.id}>
                          {`${guest.firstName} ${guest.lastName}${
                            index !== episode.guests.length - 1 ? ", " : ""
                          }`}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild>
                      <Link to={`./episodes/${episode.id}`}>View</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div>No upcoming episodes</div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
