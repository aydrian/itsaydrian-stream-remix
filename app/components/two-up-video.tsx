import type { videoSize } from "~/components/video-container";
import { VideoContainer } from "~/components/video-container";

export function TwoUpVideo({ size = "interview" }: { size?: videoSize }) {
  return (
    <>
      <VideoContainer size={size} twitter="itsaydrian" />
      <VideoContainer name="Guest" size={size} />
    </>
  );
}
