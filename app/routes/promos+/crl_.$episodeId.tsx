import { type LoaderArgs } from "@remix-run/node";
import { typedjson, useTypedLoaderData } from "remix-typedjson";

import { Avatar } from "~/components/avatar";
import { YouTube } from "~/components/brand-logos";
import * as CrlLogo from "~/components/cockroach-labs-logos";
import { prisma } from "~/utils/db.server";

export const loader = async ({ params }: LoaderArgs) => {
  const { episodeId } = params;
  const findEvent = await prisma.episode.findUnique({
    select: {
      endDate: true,
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
    where: { id: episodeId }
  });
  if (!findEvent) {
    throw new Response("Not Found", {
      status: 404
    });
  }
  const { guests, ...rest } = findEvent;
  const flatGuests = guests.map(({ guest, order }) => ({ ...guest, order }));
  const episode = { ...rest, guests: flatGuests };

  return typedjson(episode);
};

export default function CrlPromo() {
  const { guests, show, startDate, title } =
    useTypedLoaderData<typeof loader>();
  return (
    <div className="flex aspect-video h-[1080px] flex-col justify-between bg-crl-deep-purple bg-[url('/img/crl-texture-7.svg')] bg-cover px-20 py-16 font-poppins text-white">
      <header>
        <CrlLogo.FullHorizontal className="aspect-auto h-16 w-auto text-white" />
      </header>
      <div className="flex grow">
        <div className="flex h-full w-[58%] flex-col justify-between">
          <div className="flex grow flex-col justify-center">
            <h1 className="mb-1 flex max-w-fit bg-gradient-to-r from-crl-iridescent-blue to-crl-electric-purple bg-clip-text text-7xl font-bold leading-tight text-transparent">
              {show.title}
            </h1>
            <h2 className="mb-16 text-5xl font-semibold leading-tight">
              {title}
            </h2>
          </div>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col">
              <div className="text-5xl font-semibold leading-tight">
                {new Intl.DateTimeFormat("en-US", {
                  day: "numeric",
                  month: "short",
                  weekday: "short",
                  year: "numeric"
                }).format(startDate)}
              </div>
              <div className="text-4xl font-semibold leading-tight">
                {new Intl.DateTimeFormat("en-US", {
                  hour: "numeric",
                  minute: "numeric",
                  timeZone: "America/New_York",
                  timeZoneName: "short"
                }).format(startDate)}
                {" / "}
                {new Intl.DateTimeFormat("en-GB", {
                  hour: "numeric",
                  minute: "numeric",
                  timeZone: "Europe/London",
                  timeZoneName: "short"
                }).format(startDate)}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-4xl font-semibold text-crl-iridescent-blue">
                Watch at
              </div>
              <YouTube className="h-14 w-auto" />
              <span className="text-4xl font-semibold">
                youtube.com/cockroachdb
              </span>
            </div>
          </div>
        </div>
        <div className="flex min-h-fit flex-row flex-wrap items-center justify-between gap-16">
          {guests.map((guest) => (
            <div
              className="flex min-h-fit max-w-min flex-col items-center gap-8 odd:-mt-40 even:mt-40"
              key={guest.id}
            >
              <div className="min-h-fit min-w-fit">
                <Avatar
                  alt={`${guest.firstName} ${guest.lastName}`}
                  className="aspect-square h-80 bg-gradient-to-r from-crl-electric-purple to-crl-iridescent-blue p-1.5"
                  src={guest.avatarUrl}
                />
              </div>
              <div className="flex flex-col items-center text-center">
                <span className="text-3xl font-semibold text-crl-iridescent-blue">{`${guest.firstName} ${guest.lastName}`}</span>
                {guest.title || guest.company ? (
                  <span className="text-2xl font-light">{`${guest.title ?? ""}${
                    guest.title && guest.company ? ", " : ""
                  }${guest.company ?? ""}`}</span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
