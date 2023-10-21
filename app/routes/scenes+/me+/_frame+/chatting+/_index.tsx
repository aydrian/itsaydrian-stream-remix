import { VideoContainer } from "~/components/video-container";
import { useOptions } from "~/routes/scenes+/_layout";
import { useEpisode } from "~/routes/scenes+/me+/_layout";

export default function Chatting() {
  const { guests } = useEpisode();
  const { showGuides } = useOptions();
  const guest = guests[0];

  return <VideoContainer guest={guest} showGuides={showGuides} />;
}
