import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { requireUser } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { formatDateRange } from "~/utils/misc";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export const loader = async ({ request }: LoaderArgs) => {
  await requireUser(request);
  const shows = await prisma.show.findMany({
    select: {
      id: true,
      title: true,
      Episodes: {
        where: { startDate: { gte: new Date() } },
        select: {
          id: true,
          title: true,
          startDate: true,
          endDate: true,
          Guests: {
            select: {
              order: true,
              Guest: {
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
    // orderBy: { Episodes: { startDate: "asc" } }
  });
  return json({ shows });
};

export default function AdminDashboard() {
  const { shows } = useLoaderData<typeof loader>();
  return (
    <>
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      <Card>
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
                  {show.Episodes.length ? (
                    <div>
                      <div>
                        <Link
                          to={`../shows/${show.id}/episodes/${show.Episodes[0].id}`}
                        >
                          {show.Episodes[0].title}
                        </Link>
                      </div>
                      <div>
                        {formatDateRange(
                          show.Episodes[0].startDate,
                          show.Episodes[0].endDate
                        )}
                      </div>
                      <div>
                        <span className="font-semibold">Guests: </span>
                        {show.Episodes[0].Guests.map(({ Guest }, index) => (
                          <span key={Guest.id}>
                            {`${Guest.firstName} ${Guest.lastName}${
                              index !== show.Episodes[0].Guests.length - 1
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
