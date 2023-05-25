import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getNextEpisode } from "~/utils/db.server";

export const loader = async () => {
  const nextEpisode = await getNextEpisode("CRL");
  return json(nextEpisode);
};

export default function StartingSoon() {
  const { title, Show } = useLoaderData<typeof loader>();
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-crl-deep-purple text-white">
      <h1 className="mb-1 flex max-w-fit bg-gradient-to-r from-crl-iridescent-blue to-crl-electric-purple bg-clip-text text-center text-8xl font-bold leading-tight text-transparent">
        {Show.title}
      </h1>
      <h2 className="mb-16 text-7xl font-semibold leading-tight">{title}</h2>
      <h3 className="max-w-fit animate-pulse bg-gradient-to-r from-crl-iridescent-blue to-crl-electric-purple bg-clip-text text-6xl font-bold leading-tight text-transparent">
        Starting Soon...
      </h3>
    </div>
  );
}
