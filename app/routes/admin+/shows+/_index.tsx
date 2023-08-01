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
import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";

export const loader = async ({ request }: LoaderArgs) => {
  await requireUserId(request);

  const shows = await prisma.show.findMany({
    select: { description: true, id: true, title: true }
  });
  return json({ shows });
};

export default function ShowsIndex() {
  const { shows } = useLoaderData<typeof loader>();
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Shows</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            {shows.map((show) => (
              <Card key={show.id}>
                <CardHeader>
                  <CardTitle>{show.title}</CardTitle>
                </CardHeader>
                <CardContent>{show.description}</CardContent>
                <CardFooter>
                  <Button asChild size="sm">
                    <Link to={`./${show.id}`}>View</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
