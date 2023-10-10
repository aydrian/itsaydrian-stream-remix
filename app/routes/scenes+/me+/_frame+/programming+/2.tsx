import { VideoContainer } from "~/components/video-container";
import {
  CompactCaption,
  useEpisode,
  useOptions
} from "~/routes/scenes+/me+/_layout";

export default function Programming2() {
  const { guests } = useEpisode();
  const { showGuides } = useOptions();
  return (
    <>
      {guests.slice(0, 2).map((guest) => (
        <VideoContainer
          Caption={CompactCaption}
          guest={guest}
          key={guest.id}
          showGuides={showGuides}
        />
      ))}
    </>
  );
}
