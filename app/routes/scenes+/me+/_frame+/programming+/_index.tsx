import { VideoContainer } from "~/components/video-container";
import { useOptions } from "~/routes/scenes+/_layout";
import { CompactCaption, useEpisode } from "~/routes/scenes+/me+/_layout";

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
