import { VideoContainer } from "~/components/video-container";
import { useOptions } from "~/routes/scenes+/_layout";
import { useEpisode } from "~/routes/scenes+/me+/_layout";

export default function Chatting2() {
  const { guests } = useEpisode();
  const { showGuides } = useOptions();
  return (
    <>
      {guests.slice(0, 2).map((guest) => (
        <VideoContainer guest={guest} key={guest.id} showGuides={showGuides} />
      ))}
    </>
  );
}
