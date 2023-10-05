import { type SceneCollection } from "@prisma/client";
import { type LoaderArgs, json } from "@remix-run/node";
import { startOfToday } from "date-fns";

import { prisma } from "~/utils/db.server";
import { generateVDOPassword } from "~/utils/vdo-ninja.server";

export async function loader({ params, request }: LoaderArgs) {
  // TODO: Make sure request is coming from SAMMI
  const sceneCollection: SceneCollection | undefined = params.sceneCollection
    ? (params.sceneCollection.toUpperCase() as SceneCollection)
    : undefined;
  if (!sceneCollection) {
    throw new Response(null, { status: 404, statusText: "Not Found" });
  }

  const result = await prisma.episode.findFirst({
    orderBy: { startDate: "asc" },
    select: {
      guests: {
        orderBy: { order: "asc" },
        select: {
          guest: {
            select: {
              firstName: true,
              id: true,
              lastName: true
            }
          },
          order: true
        }
      },
      id: true,
      vdoPassword: true
    },
    where: {
      AND: [{ endDate: { gte: startOfToday() } }, { show: { sceneCollection } }]
    }
  });

  if (!result) {
    return json({});
  }

  const { guests, id, vdoPassword } = result;
  const vdoHash = await generateVDOPassword(vdoPassword);
  const flatGuests = guests.map(({ guest, order }) => ({ ...guest, order }));
  return json({ guests: flatGuests, id, vdoHash, vdoPassword });
}
