import type { EpisodeGuests } from "~/utils/db.server";
import clsx from "clsx";
import { useShowGuides } from "~/hooks/use-show-guides";

type props = {
  guest: EpisodeGuests[number];
  className?: string;
  showGuides?: boolean;
};

export function VideoContainer({ guest, className, showGuides }: props) {
  const { elementRef, Dimensions } = useShowGuides<HTMLElement>(
    `${guest.order === 0 ? "Host" : "Guest"} ${
      guest.order > 0 ? guest.order : ""
    }`
  );
  return (
    <figure
      ref={elementRef}
      className={clsx(
        className,
        `relative m-0 flex grow flex-col items-center justify-end`
      )}
    >
      {showGuides ? <Dimensions /> : null}

      <figcaption className="absolute bottom-4 left-4">
        <div className="rounded bg-black px-4 pb-[.625rem] pt-2 opacity-90">
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
    </figure>
  );
}
