import type { DefaultCaption } from "~/components/video-container";
import type { EpisodeGuests } from "~/utils/db.server";
import clsx from "clsx";
import { VideoContainer } from "./video-container";

type props = {
  guests: EpisodeGuests;
  direction?: "horizontal" | "vertical";
  showGuides?: boolean;
  Caption?: typeof DefaultCaption;
};

export function GuestsGrid({
  guests,
  direction = "horizontal",
  showGuides,
  Caption
}: props) {
  let width = "min-w-[512px]";
  if (guests.length > 2) {
    width = "min-w-[512px] max-w-[640px]";
  }
  if (direction === "horizontal" && [2, 4].includes(guests.length)) {
    width = "min-w-[960px]";
  }
  return (
    <div
      className={clsx(
        "flex h-full w-full flex-wrap items-stretch justify-center gap-0",
        direction === "vertical" ? "flex-col" : undefined
      )}
    >
      {guests.map((guest) => (
        <VideoContainer
          key={guest.id}
          guest={guest}
          className={width}
          showGuides={showGuides}
          Caption={Caption}
        />
      ))}
    </div>
  );
}
