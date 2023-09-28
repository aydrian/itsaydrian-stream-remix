import type { LoaderArgs } from "@remix-run/node";

import { Outlet } from "@remix-run/react";
import { typedjson, useTypedRouteLoaderData } from "remix-typedjson";

import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";

export async function loader({ request }: LoaderArgs) {
  await requireUserId(request);
  const allGuests = await prisma.guest.findMany({
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    select: { avatarUrl: true, firstName: true, id: true, lastName: true }
  });
  return typedjson({ allGuests });
}

export const handle = {
  breadcrumb: () => <span>Episodes</span>
};

export function useEpisodesLayoutLoaderData() {
  const data = useTypedRouteLoaderData<typeof loader>(
    "routes/admin+/shows+/$showId+/episodes+/_layout"
  );

  if (data === undefined) {
    throw new Error(
      "useEpisodesLayoutLoaderData must be used within the _layout route or its children"
    );
  }
  return data;
}

export default function EpisodesLayout() {
  return <Outlet />;
}
