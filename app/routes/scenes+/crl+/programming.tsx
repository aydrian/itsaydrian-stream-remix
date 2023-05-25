import { ScreenContainer } from "~/components/screen-container";
import { useEpisode } from "./_layout";
import { GuestsGrid } from "~/components/guests-grid";

export default function Programming() {
  const { guests, showGuides } = useEpisode();

  return (
    <div className="grid h-full grid-cols-[auto_1408px]">
      <GuestsGrid
        guests={guests}
        direction="vertical"
        showGuides={showGuides}
      />
      <ScreenContainer showGuides={showGuides} />
    </div>
  );
}
