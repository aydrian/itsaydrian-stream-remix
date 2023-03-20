import { OneUpVideo } from "~/components/one-up-video";

export default function SoloProgramming() {
  return (
    <div className="grid h-full grid-cols-[1348px_572px]">
      <div></div>
      <div className="flex flex-col justify-start">
        <OneUpVideo size="sidebar-solo" />
      </div>
    </div>
  );
}
