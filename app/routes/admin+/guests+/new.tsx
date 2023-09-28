import type { LoaderArgs } from "@remix-run/node";

import { GuestEditor } from "~/routes/resources+/guest-editor";
import { requireUserId } from "~/utils/auth.server";

export async function loader({ request }: LoaderArgs) {
  return await requireUserId(request);
}

export const handle = {
  breadcrumb: () => <span>New</span>
};

export default function GuestsNew() {
  return (
    <>
      <h2 className="text-3xl font-bold tracking-tight">New Guest</h2>
      <GuestEditor />
    </>
  );
}
