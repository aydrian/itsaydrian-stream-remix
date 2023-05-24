import { useEpisode } from "./_layout";
import { GuestsGrid } from "~/components/guests-grid";

export default function Chatting() {
  const { guests } = useEpisode();
  return <GuestsGrid guests={guests} />;
}
