import { type DataFunctionArgs, json } from "@remix-run/node";

import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";

export const loader = async ({ params, request }: DataFunctionArgs) => {
  await requireUserId(request);
  const { guestId } = params;

  const guest = await prisma.guest.findUnique({
    select: { avatarUrl: true, firstName: true, id: true, lastName: true },
    where: { id: guestId }
  });

  return json({ guest });
};
