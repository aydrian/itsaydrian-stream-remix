import { type LoaderFunctionArgs } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { typedjson, useTypedRouteLoaderData } from "remix-typedjson";

import { getNextEpisode } from "~/utils/db.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const episode = await getNextEpisode("CRL");

  return typedjson({ episode });
}

export function useEpisode() {
  const data = useTypedRouteLoaderData<typeof loader>(
    "routes/scenes+/crl+/_layout"
  );
  if (data === undefined) {
    throw new Error(
      "useEpisode must be used within the routes/scenes+/crl+/ route or its children"
    );
  }
  return data.episode;
}

export default function Layout() {
  return <Outlet />;
}
