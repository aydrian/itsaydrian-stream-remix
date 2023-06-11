import type { SceneCollection } from "@prisma/client";

import { PrismaClient } from "@prisma/client";
import { startOfToday } from "date-fns";

import { singleton } from "./singleton.server";

const prisma = singleton("prisma", () => new PrismaClient());
prisma.$connect();

export { prisma };

export async function getNextEpisode(sceneCollection: SceneCollection) {
  const result = await prisma.episode.findFirst({
    orderBy: { startDate: "asc" },
    select: {
      guests: {
        orderBy: { order: "asc" },
        select: {
          guest: {
            select: {
              avatarUrl: true,
              company: true,
              firstName: true,
              id: true,
              lastName: true,
              title: true,
              twitter: true
            }
          },
          order: true
        }
      },
      id: true,
      show: {
        select: { title: true }
      },
      startDate: true,
      title: true
    },
    where: {
      AND: [{ endDate: { gte: startOfToday() } }, { show: { sceneCollection } }]
    }
  });
  if (!result) {
    return {
      date: startOfToday(),
      guests: [
        {
          avatarUrl:
            "https://pbs.twimg.com/profile_images/1637838912243617793/XmhcZyZy_400x400.jpg",
          company: "Cockroach Labs",
          firstName: "Aydrian",
          id: "2a300449-cefd-435c-99ad-5165e7df56fb",
          lastName: "Howard",
          order: 0,
          title: "Developer Advocate",
          twitter: "itsaydrian"
        },
        {
          avatarUrl:
            "https://pbs.twimg.com/profile_images/1637838912243617793/XmhcZyZy_400x400.jpg",
          company: "Sploots, Inc.",
          firstName: "Atticus",
          id: "5c78fa61-df73-41e4-a4c4-f5f26507b9a2",
          lastName: "Howard",
          order: 1,
          title: "Chief Woof Officer"
        }
      ],
      id: "a1961b04-a5f5-4494-b49b-a15407648f62",
      show: { title: "Test Show" },
      title: "Test Episode"
    };
  }
  const { guests, ...rest } = result;
  const flatGuests = guests.map(({ guest, order }) => ({ ...guest, order }));
  return { ...rest, guests: flatGuests };
}

export type EpisodeGuests = Awaited<
  ReturnType<typeof getNextEpisode>
>["guests"];
