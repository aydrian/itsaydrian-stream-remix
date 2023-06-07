import { json, type LoaderArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { EpisodeEditor } from "~/routes/resources+/episode-editor";
import { requireUser } from "~/utils/auth.server";

export const loader = async ({ params, request }: LoaderArgs) => {
  await requireUser(request);
  const { showId } = params;
  invariant(typeof showId === "string", "Show ID should be a string.");

  return json({ showId });
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