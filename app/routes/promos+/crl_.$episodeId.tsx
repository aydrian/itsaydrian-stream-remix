import { type LoaderFunctionArgs } from "@remix-run/node";
import { typedjson, useTypedLoaderData } from "remix-typedjson";

import { Avatar } from "~/components/avatar";
import { Icon } from "~/components/icon";
import { prisma } from "~/utils/db.server";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { episodeId } = params;
  const findEvent = await prisma.episode
    .findUniqueOrThrow({
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
        subtitle: true,
        title: true
      },
      where: { id: episodeId }
    })
    .catch(() => {
      throw new Response(null, { status: 404, statusText: "Not Found" });
    });
  const { guests, ...rest } = findEvent;
  const flatGuests = guests.map(({ guest, order }) => ({ ...guest, order }));
  const episode = { ...rest, guests: flatGuests };

  return typedjson(episode);
};

export default function CrlPromo() {
  const { guests, show, startDate, subtitle, title } =
    useTypedLoaderData<typeof loader>();
  return (
    <div className="grid aspect-video h-[1080px] grid-cols-[1020px_auto] grid-rows-[min-content_auto] bg-crl-deep-purple bg-[url('/img/crl-texture-7.svg')] bg-cover px-20 py-16 font-poppins text-white">
      <header className="col-span-2">
        <Icon
          className="aspect-auto h-16 w-auto text-white"
          name="crl-full-horizontal"
        />
      </header>
      <div className="row-start-2 flex h-full w-[1020px] flex-col justify-between">
        <div className="flex grow flex-col justify-center pr-16">
          <h1 className="mb-1 flex max-w-fit bg-gradient-to-r from-crl-iridescent-blue to-crl-electric-purple bg-clip-text text-7xl font-bold leading-tight text-transparent">
            {show.title}
          </h1>
          <h2 className="text-5xl font-semibold leading-tight">{title}</h2>
          {subtitle ? (
            <h3 className="text-4xl font-medium leading-tight text-gray-200">
              {subtitle}
            </h3>
          ) : null}
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
            <Icon className="h-14 w-14" name="youtube" />
            <span className="text-4xl font-semibold">
              youtube.com/cockroachdb
            </span>
          </div>
        </div>
      </div>
      {guests.length === 2 ? (
        <div className="col-start-2 row-start-2 flex min-h-fit flex-row flex-wrap items-center justify-between gap-16">
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
      ) : null}
      {guests.length === 6 ? (
        <div className="col-start-2 row-start-2 flex flex-col justify-around">
          <div className="flex justify-around">
            {guests.slice(0, 2).map((guest) => (
              <div
                className="flex min-h-fit max-w-min flex-col items-center gap-8"
                key={guest.id}
              >
                <div className="min-h-fit min-w-fit">
                  <Avatar
                    alt={`${guest.firstName} ${guest.lastName}`}
                    className="aspect-square w-64 bg-gradient-to-r from-crl-electric-purple to-crl-iridescent-blue p-1.5"
                    src={guest.avatarUrl}
                  />
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="text-3xl font-semibold text-crl-iridescent-blue">{`${guest.firstName} ${guest.lastName}`}</div>
                  {guest.title ? (
                    <div className="whitespace-nowrap text-2xl font-light">
                      {guest.title}
                    </div>
                  ) : null}
                  {guest.company ? (
                    <div className="text-xl font-light">{guest.company}</div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between">
            {guests.slice(2).map((guest) => (
              <div
                className="flex min-h-fit max-w-min flex-col items-center gap-8"
                key={guest.id}
              >
                <div className="min-h-fit min-w-fit">
                  <Avatar
                    alt={`${guest.firstName} ${guest.lastName}`}
                    className="aspect-square w-44 bg-gradient-to-r from-crl-electric-purple to-crl-iridescent-blue p-1.5"
                    src={guest.avatarUrl}
                  />
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="whitespace-nowrap text-xl font-semibold text-crl-iridescent-blue">{`${guest.firstName} ${guest.lastName}`}</div>
                  {guest.title ? (
                    <div className="text-lg font-light">{guest.title}</div>
                  ) : null}
                  {guest.company ? (
                    <div className="text-base font-light">{guest.company}</div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
