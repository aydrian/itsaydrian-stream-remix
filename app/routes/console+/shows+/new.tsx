import type { LoaderFunctionArgs } from "@remix-run/node";

import { requireUserId } from "~/utils/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserId(request);
  return null;
}

export const handle = {
  breadcrumb: () => <span>New</span>
};

export default function NewShow() {
  return (
    <>
      <h2 className="text-3xl font-bold tracking-tight">New Show</h2>
    </>
  );
}
