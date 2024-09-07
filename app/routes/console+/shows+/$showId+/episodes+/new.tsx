import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

import { EpisodeEditor } from "~/routes/resources+/episode-editor";
import { requireUserId } from "~/utils/auth.server";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  await requireUserId(request);
  const { showId } = params;
  invariant(typeof showId === "string", "Show ID should be a string.");

  return json({ showId });
};

export const handle = {
  breadcrumb: () => <span>New</span>
};

export default function NewEpisode() {
  const { showId } = useLoaderData<typeof loader>();

  return (
    <>
      <h2 className="text-3xl font-bold tracking-tight">New Episode</h2>
      <EpisodeEditor showId={showId} />
    </>
  );
}
