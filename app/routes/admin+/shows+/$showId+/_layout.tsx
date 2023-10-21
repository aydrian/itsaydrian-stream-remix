import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";

import { Icon } from "~/components/icon";
import { Button } from "~/components/ui/button";
import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { type ResolvedRemixLoader } from "~/utils/types";

export async function loader({ params, request }: LoaderFunctionArgs) {
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
      <Icon className="mr-1 h-6 w-6" name="tv-2" />
      <span>{data.title}</span>
    </>
  )
};
export default function ShowIdLayout() {
  const { description, title } = useLoaderData<typeof loader>();
  return (
    <>
      <div className="mb-2 flex justify-between">
        <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        <Button asChild size="sm">
          <Link to="./episodes/new">New Episode</Link>
        </Button>
      </div>
      <p>{description}</p>
      <Outlet />
    </>
  );
}
