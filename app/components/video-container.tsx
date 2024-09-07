import clsx from "clsx";

import type { EpisodeGuests } from "~/utils/db.server";

import { useShowGuides } from "~/hooks/use-show-guides";

type props = {
  Caption?: typeof DefaultCaption;
  className?: string;
  guest: EpisodeGuests[number];
  showGuides?: boolean;
};

export function VideoContainer({
  Caption = DefaultCaption,
  className,
  guest,
  showGuides
}: props) {
  const { elementRef, Guide } = useShowGuides<HTMLElement>(
    `${guest.order === 0 ? "Host" : "Guest"} ${
      guest.order > 0 ? guest.order : ""
    }`
  );
  return (
    <figure
      className={clsx(
        className,
        `relative m-0 flex grow flex-col items-center justify-end`
      )}
      ref={elementRef}
    >
      {showGuides ? <Guide /> : null}

      <Caption guest={guest} />
    </figure>
  );
}

export function DefaultCaption({ guest }: { guest: EpisodeGuests[number] }) {
  return (
    <figcaption className="absolute bottom-4 left-4 z-10">
      <div className="rounded bg-blue-950 px-4 pb-[.625rem] pt-2 opacity-90">
        <h1 className="relative z-10 block text-3xl font-normal text-white">
          {`${guest.firstName} ${guest.lastName}`}
        </h1>
        {guest.twitter && (
          <h2 className="text-2xl text-gray-300">@{guest.twitter}</h2>
        )}
        {guest.title && (
          <h3 className="text-xl text-gray-300">{guest.title}</h3>
        )}
      </div>
    </figcaption>
  );
}
