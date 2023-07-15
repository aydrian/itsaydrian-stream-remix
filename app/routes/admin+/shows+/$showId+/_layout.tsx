import { type LoaderArgs, json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { Tv2 } from "lucide-react";

import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { type ResolvedRemixLoader } from "~/utils/types";

export async function loader({ params, request }: LoaderArgs) {
  await requireUserId(request);
  const { showId } = params;
  const show = await prisma.show.findUnique({
    select: {
      description: true,
      id: true,
      title: true
    },
    where: { id: showId }
  });
  if (!show) {
    throw new Response("Not Found", {
      status: 404
    });
  }

  return json({ ...show });
}

export const handle = {
  breadcrumb: (data: ResolvedRemixLoader<typeof loader>) => (
    <>
      <Tv2 className="mr-1" />
      <span>{data.title}</span>
    </>
  )
};
export default function ShowIdLayout() {
  const { description, title } = useLoaderData<typeof loader>();
  return (
    <>
      <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
      <p>{description}</p>
      <Outlet />
    </>
  );
}
