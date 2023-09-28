import { type LoaderArgs, json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
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

export async function loader({ request }: LoaderArgs) {
  await requireUserId(request);

  const guests = await prisma.guest.findMany({
    orderBy: { lastName: "asc" },
    select: {
      avatarUrl: true,
      company: true,
      firstName: true,
      id: true,
      lastName: true,
      title: true
    }
  });
  return json({ guests });
}
export default function Guests() {
  const { guests } = useLoaderData<typeof loader>();
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Guests</CardTitle>
        <Button asChild size="sm">
          <Link to="./new">New Guest</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {guests.map((guest) => (
            <Card className="md:w-60" key={guest.id}>
              <CardHeader>
                <CardTitle className="flex flex-row items-center gap-1.5">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      alt={`${guest.firstName} ${guest.lastName}`}
                      src={guest.avatarUrl ?? undefined}
                    />
                    <AvatarFallback>{`${guest.firstName.charAt(
                      0
                    )}${guest.lastName.charAt(0)}`}</AvatarFallback>
                  </Avatar>
                  <span>{`${guest.firstName} ${guest.lastName}`}</span>
                </CardTitle>
                <CardDescription>{`${guest.title} at ${guest.company}`}</CardDescription>
              </CardHeader>
              <CardFooter className="gap-2">
                <Button asChild size="sm">
                  <Link to={`./${guest.id}`}>View</Link>
                </Button>
                <Button asChild size="sm">
                  <Link to={`./${guest.id}/edit`}>Edit</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
