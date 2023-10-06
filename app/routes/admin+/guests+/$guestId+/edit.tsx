import type { LoaderFunctionArgs } from "@remix-run/node";

import { typedjson, useTypedLoaderData } from "remix-typedjson";

import { GuestEditor } from "~/routes/resources+/guest-editor";
import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";

export async function loader({ params, request }: LoaderFunctionArgs) {
  await requireUserId(request);
  const { guestId } = params;
  const guest = await prisma.guest
    .findUniqueOrThrow({
      where: { id: guestId }
    })
    .catch((err) => {
      console.error(err);
      throw new Response(null, { status: 404, statusText: "Not Found" });
    });

  return typedjson({ guest });
}

export const handle = {
  breadcrumb: () => <span>Edit Guest</span>
};

export default function GuestIdEdit() {
  const { guest } = useTypedLoaderData<typeof loader>();
  return (
    <>
      <h2 className="text-3xl font-bold tracking-tight">Edit Guest</h2>
      <GuestEditor guest={guest} />
    </>
  );
}
