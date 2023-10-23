import type { LoaderFunctionArgs } from "@remix-run/node";

import { typedjson, useTypedLoaderData } from "remix-typedjson";

import { ShowEditor } from "~/routes/resources+/show-editor";
import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";

export async function loader({ params, request }: LoaderFunctionArgs) {
  await requireUserId(request);
  const { showId } = params;
  const show = await prisma.show
    .findUniqueOrThrow({ where: { id: showId } })
    .catch(() => {
      throw new Response(null, { status: 404, statusText: "Not Found" });
    });

  return typedjson({ show });
}

export const handle = {
  breadcrumb: () => <span>Edit Show</span>
};

export default function EditEpisode() {
  const { show } = useTypedLoaderData<typeof loader>();

  return (
    <>
      <h3 className="text-xl font-bold tracking-tight">Edit Episode</h3>
      <ShowEditor show={show} />
    </>
  );
}
