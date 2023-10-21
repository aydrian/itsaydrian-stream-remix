import type { LoaderFunctionArgs } from "@remix-run/node";

import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { formatDateRange } from "~/utils/misc";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireUserId(request);
  const episodes = await prisma.episode.findMany({
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
      show: {
        select: {
          id: true,
          title: true
        }
      },
      startDate: true,
      title: true
    },
    take: 1,
    where: { startDate: { gte: new Date() } }
  });

  return json({ episodes });
};

export default function AdminIndex() {
  const { episodes } = useLoaderData<typeof loader>();
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Episodes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            {episodes.length === 0 ? (
              <div>There are no upcoming episodes.</div>
            ) : null}
            {episodes.map(({ show, ...episode }) => (
              <Card key={episode.id}>
                <CardHeader>
                  <CardTitle>
                    <Link to={`./shows/${show.id}`}>{show.title}</Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {episodes.length ? (
                    <div>
                      <div>
                        <Link to={`./shows/${show.id}/episodes/${episode.id}`}>
                          {episode.title}
                        </Link>
                      </div>
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
                    </div>
                  ) : (
                    <div>No upcoming episodes</div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
