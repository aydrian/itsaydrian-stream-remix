import type { DefaultCaption } from "~/components/video-container";
import type { EpisodeGuests } from "~/utils/db.server";

import { cn } from "~/utils/misc";

import { Icon } from "./icon";
import { VideoContainer } from "./video-container";

export function GuestsGrid({
  Caption,
  direction = "horizontal",
  guests,
  showGuides
}: {
  Caption?: typeof DefaultCaption;
  direction?: "horizontal" | "vertical";
  guests: EpisodeGuests;
  showGuides?: boolean;
}) {
  let width = "min-w-[350px]";
  if (guests.length > 2) {
    width = "min-w-[350px] max-w-[640px]";
  }
  if (direction === "horizontal" && [2, 4].includes(guests.length)) {
    width = "min-w-[960px]";
  }
  if (direction === "horizontal" && [6].includes(guests.length)) {
    width = "w-[640px]";
  }
  if (direction === "vertical" && [6].includes(guests.length)) {
    width = "w-1/2";
    direction = "horizontal";
    Caption = CrlSuperCompactCaption;
  }
  return (
    <div
      className={cn(
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

function CrlSuperCompactCaption({ guest }: { guest: EpisodeGuests[number] }) {
  return (
    <figcaption className="absolute bottom-0 left-0 z-10 w-full bg-crl-deep-purple px-4 pb-[.625rem] pt-2">
      <div className="flex w-full flex-col flex-wrap justify-between">
        <h1 className="relative z-10 block text-xl font-semibold text-white">
          <span>{guest.firstName}</span>
        </h1>
        {guest.twitter && (
          <h2 className="text-base text-crl-neutral-200">
            <Icon className="mr-0.5 inline-block h-4 w-4" name="twitter" />
            <span>@{guest.twitter}</span>
          </h2>
        )}
      </div>
    </figcaption>
  );
}
