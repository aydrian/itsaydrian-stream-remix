import type { SceneCollection } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import { startOfToday } from "date-fns";
import { singleton } from "./singleton.server";

const prisma = singleton("prisma", () => new PrismaClient());
prisma.$connect();

export { prisma };

export async function getNextEpisode(sceneCollection: SceneCollection) {
  const result = await prisma.episode.findFirst({
    where: {
      AND: [{ endDate: { gte: startOfToday() } }, { show: { sceneCollection } }]
    },
    select: {
      id: true,
      startDate: true,
      title: true,
      show: {
        select: { title: true }
      },
      guests: {
        select: {
          order: true,
          guest: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              title: true,
              company: true,
              twitter: true,
              avatarUrl: true
            }
          }
        },
        orderBy: { order: "asc" }
      }
    },
    orderBy: { startDate: "asc" }
  });
  if (!result) {
    return {
      id: "a1961b04-a5f5-4494-b49b-a15407648f62",
      date: startOfToday(),
      title: "Test Episode",
      show: { title: "Test Show" },
      guests: [
        {
          order: 0,
          id: "2a300449-cefd-435c-99ad-5165e7df56fb",
          firstName: "Aydrian",
          lastName: "Howard",
          title: "Developer Advocate",
          company: "Cockroach Labs",
          twitter: "itsaydrian",
          avatarUrl:
            "https://pbs.twimg.com/profile_images/1637838912243617793/XmhcZyZy_400x400.jpg"
        },
        {
          order: 1,
          id: "5c78fa61-df73-41e4-a4c4-f5f26507b9a2",
          firstName: "Atticus",
          lastName: "Howard",
          title: "Chief Woof Officer",
          company: "Sploots, Inc.",
          avatarUrl:
            "https://pbs.twimg.com/profile_images/1637838912243617793/XmhcZyZy_400x400.jpg"
        }
      ]
    };
  }
  const { guests, ...rest } = result;
  const flatGuests = guests.map(({ guest, order }) => ({ ...guest, order }));
  return { ...rest, guests: flatGuests };
}

export type EpisodeGuests = Awaited<
  ReturnType<typeof getNextEpisode>
>["guests"];
