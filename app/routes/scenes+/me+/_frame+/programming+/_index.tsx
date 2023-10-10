import { VideoContainer } from "~/components/video-container";
import {
  CompactCaption,
  useEpisode,
  useOptions
} from "~/routes/scenes+/me+/_layout";

export default function Programming() {
  const { guests } = useEpisode();
  const { showGuides } = useOptions();
  const guest = guests[0];

  return (
    <VideoContainer
      Caption={CompactCaption}
      guest={guest}
      showGuides={showGuides}
    />
  );
}
