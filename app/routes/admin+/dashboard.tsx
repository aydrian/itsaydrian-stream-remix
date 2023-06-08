import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { formatDateRange } from "~/utils/misc";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export const loader = async ({ request }: LoaderArgs) => {
  await requireUserId(request);
  const shows = await prisma.show.findMany({
    select: {
      id: true,
      title: true,
      episodes: {
        where: { startDate: { gte: new Date() } },
        select: {
          id: true,
          title: true,
          startDate: true,
          endDate: true,
          guests: {
            select: {
              order: true,
              guest: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  twitter: true
                }
              }
            },
            orderBy: { order: "asc" }
          }
        },
        orderBy: { startDate: "asc" },
        take: 1
      }
    }
    // orderBy: { episodes: { startDate: "asc" } }
  });
  return json({ shows });
};

export default function AdminDashboard() {
  const { shows } = useLoaderData<typeof loader>();
  return (
    <>
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      <Card className="max-w-fit">
        <CardHeader>
          <CardTitle>Upcoming Episodes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            {shows.map((show) => (
              <Card key={show.id}>
                <CardHeader>
                  <CardTitle>
                    <Link to={`../shows/${show.id}`}>{show.title}</Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {show.episodes.length ? (
                    <div>
                      <div>
                        <Link
                          to={`../shows/${show.id}/episodes/${show.episodes[0].id}`}
                        >
                          {show.episodes[0].title}
                        </Link>
                      </div>
                      <div>
                        {formatDateRange(
                          show.episodes[0].startDate,
                          show.episodes[0].endDate
                        )}
                      </div>
                      <div>
                        <span className="font-semibold">Guests: </span>
                        {show.episodes[0].guests.map(({ guest }, index) => (
                          <span key={guest.id}>
                            {`${guest.firstName} ${guest.lastName}${
                              index !== show.episodes[0].guests.length - 1
                                ? ", "
                                : ""
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
