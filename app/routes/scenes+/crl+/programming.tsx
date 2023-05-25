import { useEpisode } from "./_layout";
import { GuestsGrid } from "~/components/guests-grid";
import { useShowGuides } from "~/hooks/use-show-guides";

export default function Programming() {
  const { elementRef, Dimensions } = useShowGuides<HTMLDivElement>();
  const { guests, showGuides } = useEpisode();

  return (
    <div className="grid h-full grid-cols-[auto_1408px]">
      <GuestsGrid
        guests={guests}
        direction="vertical"
        showGuides={showGuides}
      />
      <div ref={elementRef} className="aspect-[16/10] h-full bg-transparent">
        {showGuides ? <Dimensions /> : null}
      </div>
    </div>
  );
}
