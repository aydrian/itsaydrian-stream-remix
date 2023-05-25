import { useEpisode } from "./_layout";
import { GuestsGrid } from "~/components/guests-grid";
import { ScreenContainer } from "~/components/screen-container";

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
