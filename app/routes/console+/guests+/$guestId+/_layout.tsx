import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { Outlet } from "@remix-run/react";

import { Icon } from "~/components/icon";
import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { type ResolvedRemixLoader } from "~/utils/types";

export async function loader({ params, request }: LoaderFunctionArgs) {
  await requireUserId(request);
  const { guestId } = params;
  const guest = await prisma.guest
    .findUniqueOrThrow({
      select: {
        firstName: true,
        id: true,
        lastName: true
      },
      where: { id: guestId }
    })
    .catch((err) => {
      console.error(err);
      throw new Response(null, { status: 404, statusText: "Not Found" });
    });

  return json({ ...guest });
}

export const handle = {
  breadcrumb: (data: ResolvedRemixLoader<typeof loader>) => (
    <>
      <Icon className="mr-1 h-6 w-6" name="user-square-2" />
      <span>{`${data.firstName} ${data.lastName}`}</span>
    </>
  )
};

export default function GuestIdLayout() {
  return <Outlet />;
}
