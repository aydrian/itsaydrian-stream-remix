import clsx from "clsx";
import { VideoContainer } from "./video-container";

type props = {
  guests: { name: string; twitter?: string; title?: string }[];
  direction?: "horizontal" | "vertical";
};

export function GuestsGrid({ guests, direction = "horizontal" }: props) {
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
      {guests.map((guest, index) => (
        <VideoContainer
          key={`${guest.name}${index}`}
          name={guest.name}
          twitter={guest.twitter}
          title={guest.title}
          className={width}
        />
      ))}
    </div>
  );
}
