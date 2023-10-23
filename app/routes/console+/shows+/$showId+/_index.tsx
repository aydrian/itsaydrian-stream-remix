import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "~/components/ui/card";
import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { formatDateRange } from "~/utils/misc";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  await requireUserId(request);
  const { showId } = params;
  const show = await prisma.show.findUnique({
    select: {
      episodes: {
        orderBy: { startDate: "asc" },
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
                    <CardFooter className="flex justify-between">
                      <Button asChild size="sm">
                        <Link to={`./episodes/${episode.id}`}>View</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div>No upcoming episodes</div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
