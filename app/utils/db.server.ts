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
      AND: [{ endDate: { gte: startOfToday() } }, { Show: { sceneCollection } }]
    },
    select: {
      id: true,
      startDate: true,
      title: true,
      Show: {
        select: { title: true }
      },
      Guests: {
        select: {
          Guest: {
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
    }
  });
  if (!result) {
    return {
      id: "a1961b04-a5f5-4494-b49b-a15407648f62",
      date: startOfToday(),
      title: "Test Episode",
      Show: { title: "Test Show" },
      Guests: [
        {
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
  const { Guests, ...rest } = result;
  const flatGuests = Guests.map(({ Guest }) => Guest);
  return { ...rest, Guests: flatGuests };
}

export type EpisodeGuests = Awaited<
  ReturnType<typeof getNextEpisode>
>["Guests"];
