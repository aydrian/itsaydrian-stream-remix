import { type LoaderArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
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
      <CardHeader>
        <CardTitle>Guests</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          {guests.map((guest) => (
            <Card key={guest.id}>
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
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
