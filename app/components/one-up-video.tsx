import type { videoSize } from "~/components/video-container";
import { VideoContainer } from "~/components/video-container";

export function OneUpVideo({ size = "monologue" }: { size?: videoSize }) {
  return <VideoContainer size={size} twitter="itsaydrian" />;
}
