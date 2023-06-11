import clsx from "clsx";

import type { DefaultCaption } from "~/components/video-container";
import type { EpisodeGuests } from "~/utils/db.server";

import { VideoContainer } from "./video-container";

type props = {
  Caption?: typeof DefaultCaption;
  direction?: "horizontal" | "vertical";
  guests: EpisodeGuests;
  showGuides?: boolean;
};

export function GuestsGrid({
  Caption,
  direction = "horizontal",
  guests,
  showGuides
}: props) {
  let width = "min-w-[350px]";
  if (guests.length > 2) {
    width = "min-w-[350px] max-w-[640px]";
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
          Caption={Caption}
          className={width}
          guest={guest}
          key={guest.id}
          showGuides={showGuides}
        />
      ))}
    </div>
  );
}
