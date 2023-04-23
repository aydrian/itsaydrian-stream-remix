import { VideoContainer } from "../components/video-container";

export function TwoUpVideo({ size = "interview" }) {
  return (
    <>
      <VideoContainer size={size} twitter="itsaydrian" />
      <VideoContainer name="Guest" size={size} />
    </>
  );
}
