import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getNextEpisode } from "~/utils/db.server";
import * as CrlLogo from "~/components/cockroach-labs-logos";
import { Avatar } from "~/components/avatar";

export const loader = async () => {
  const nextEpisode = await getNextEpisode("CRL");
  return json(nextEpisode);
};

export default function StartingSoon() {
  const { title, show, guests } = useLoaderData<typeof loader>();
  return (
    <div className="flex aspect-video h-[1080px] flex-col justify-between bg-crl-deep-purple bg-[url('/img/crl-texture-7.svg')] bg-cover px-20 py-16 font-poppins text-white">
      <header>
        <CrlLogo.FullHorizontal className="aspect-auto h-16 w-auto text-white" />
      </header>
      <div className="flex justify-between">
        <div className="flex h-full w-[58%] flex-col justify-center">
          <h1 className="mb-1 flex max-w-fit bg-gradient-to-r from-crl-iridescent-blue to-crl-electric-purple bg-clip-text text-7xl font-bold leading-tight text-transparent">
            {show.title}
          </h1>
          <h2 className="mb-16 text-5xl font-semibold leading-tight">
            {title}
          </h2>
        </div>
        <div className="flex min-h-fit flex-row flex-wrap items-center justify-between gap-16">
          {guests.map((guest) => (
            <div
              key={guest.id}
              className="flex min-h-fit max-w-min flex-col items-center gap-8 odd:-mt-40 even:mt-40"
            >
              <div className="min-h-fit min-w-fit">
                <Avatar
                  src={guest.avatarUrl}
                  alt={`${guest.firstName} ${guest.lastName}`}
                  className="aspect-square h-80 bg-gradient-to-r from-crl-electric-purple to-crl-iridescent-blue p-1.5"
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
      <footer className="flex justify-center">
        <h3 className="max-w-fit animate-pulse bg-gradient-to-r from-crl-iridescent-blue to-crl-electric-purple bg-clip-text text-6xl font-bold leading-tight text-transparent">
          Starting Soon...
        </h3>
      </footer>
    </div>
  );
}
