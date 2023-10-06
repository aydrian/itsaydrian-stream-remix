import { type LoaderFunctionArgs } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";

import { Button } from "~/components/ui/button";
import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";

export async function loader({ params, request }: LoaderFunctionArgs) {
  await requireUserId(request);
  const { guestId } = params;
  const guest = await prisma.guest
    .findUniqueOrThrow({
      select: {
        firstName: true,
        id: true,
        lastName: true
      },
      where: { id: guestId }
    })
    .catch((err) => {
      console.error(err);
      throw new Response(null, { status: 404, statusText: "Not Found" });
    });

  return typedjson({ guest });
}

export default function GuestIdIndex() {
  const { guest } = useTypedLoaderData<typeof loader>();
  return (
    <div className="flex justify-between">
      <h2 className="text-3xl font-bold tracking-tight">{`${guest.firstName} ${guest.lastName}`}</h2>
      <Button asChild size="sm">
        <Link to="./edit">Edit</Link>
      </Button>
    </div>
  );
}
