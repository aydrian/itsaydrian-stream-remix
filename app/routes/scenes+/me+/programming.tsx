import { useEpisode } from "./_layout";
import { GuestsGrid } from "~/components/guests-grid";

export default function Programming() {
  const { guests } = useEpisode();
  return (
    <div className="grid h-full grid-cols-[auto_1408px]">
      <GuestsGrid guests={guests} direction="vertical" />
      <div className="aspect-[16/10] h-full bg-transparent"></div>
    </div>
  );
}
