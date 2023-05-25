import { type LoaderArgs, Response, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEpisode } from "./_layout";
import { GuestsGrid } from "~/components/guests-grid";
import { useShowGuides } from "~/hooks/use-show-guides";

export const loader = async ({ params }: LoaderArgs) => {
  const num = parseInt(params.num ?? "");

  if (isNaN(num)) {
    throw new Response("Parameter expected to be a number", { status: 400 });
  }

  return json({ num });
};

export default function Programming() {
  const { num } = useLoaderData<typeof loader>();
  const { guests, showGuides } = useEpisode();
  const { elementRef, Dimensions } = useShowGuides<HTMLDivElement>();
  const slice = guests.slice(0, num);
  return (
    <div className="grid h-full grid-cols-[auto_1408px]">
      <GuestsGrid guests={slice} direction="vertical" showGuides={showGuides} />
      <div ref={elementRef} className="aspect-[16/10] h-full bg-transparent">
        {showGuides ? <Dimensions /> : null}
      </div>
    </div>
  );
}
