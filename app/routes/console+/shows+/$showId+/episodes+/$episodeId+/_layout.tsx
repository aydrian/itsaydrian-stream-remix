import type { LoaderFunctionArgs } from "@remix-run/node";

import { Outlet } from "@remix-run/react";

import { Icon } from "~/components/icon";
import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { type ResolvedRemixLoader } from "~/utils/types";

export async function loader({ params, request }: LoaderFunctionArgs) {
  await requireUserId(request);
  const { episodeId } = params;

  const epsiode = await prisma.episode.findUnique({
    select: { id: true, title: true },
    where: { id: episodeId }
  });
  if (!epsiode) {
    throw new Response("Not Found", {
      status: 404
    });
  }

  return { ...epsiode };
}

export const handle = {
  breadcrumb: (data: ResolvedRemixLoader<typeof loader>) => (
    <>
      <Icon className="mr-1 h-6 w-6" name="video" />
      <span>{data.title}</span>
    </>
  )
};
export default function EpisodeIdLayout() {
  return <Outlet />;
}
