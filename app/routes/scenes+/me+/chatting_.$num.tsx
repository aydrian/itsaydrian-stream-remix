import { type LoaderArgs, Response, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEpisode } from "./_layout";
import { GuestsGrid } from "~/components/guests-grid";

export const loader = async ({ params }: LoaderArgs) => {
  const num = parseInt(params.num ?? "");

  if (isNaN(num)) {
    throw new Response("Parameter expected to be a number", { status: 400 });
  }

  return json({ num });
};

export default function Chatting() {
  const { num } = useLoaderData<typeof loader>();
  const { guests, showGuides } = useEpisode();
  const slice = guests.slice(0, num);
  return <GuestsGrid guests={slice} showGuides={showGuides} />;
}