import { VideoContainer } from "../components/video-container";

export function TwoUpVideo({ size = "interview" }) {
  return (
    <>
      <VideoContainer size={size} />
      <VideoContainer size={size} />
    </>
  );
}
