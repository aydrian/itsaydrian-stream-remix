import type { LoaderFunctionArgs } from "@remix-run/node";

import { type SceneCollection } from "@prisma/client";
import { useLoaderData } from "@remix-run/react";
import { startOfToday } from "date-fns";

import { prisma } from "~/utils/db.server";

export async function loader({ params }: LoaderFunctionArgs) {
  const sceneCollection: SceneCollection | undefined = params.sceneCollection
    ? (params.sceneCollection.toUpperCase() as SceneCollection)
    : undefined;
  const num = params.num ? parseInt(params.num) : NaN;
  console.log({ num, sceneCollection });
  if (!sceneCollection || isNaN(num)) {
    throw new Response(null, { status: 400, statusText: "Bad Request" });
  }
  const result = await prisma.episode.findFirstOrThrow({
    orderBy: { startDate: "asc" },
    select: {
      guests: {
        select: {
          guest: {
            select: {
              avatarUrl: true,
              firstName: true,
              id: true,
              lastName: true
            }
          },
          order: true
        },
        where: { order: num }
      },
      id: true
    },
    where: {
      AND: [
        { endDate: { gte: startOfToday() } },
        {
          show: {
            sceneCollection
          }
        }
      ]
    }
  });
  const { guests, ...rest } = result;
  const flatGuests = guests.map(({ guest, order }) => ({ ...guest, order }));
  return { ...rest, guest: flatGuests[0] };
}
export default function SceneCollectionGuestsNum() {
  const { guest } = useLoaderData<typeof loader>();
  return (
    <>
      {guest.avatarUrl ? (
        <img
          alt={`${(guest.firstName, guest.lastName)}`}
          className="h-screen w-full overflow-x-hidden object-cover"
          src={guest.avatarUrl}
        />
      ) : (
        <div className="h-screen w-full">
          {guest.firstName} {guest.lastName}
        </div>
      )}
    </>
  );
}
