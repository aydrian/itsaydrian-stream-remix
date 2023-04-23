import { OneUpVideo } from "~/components/one-up-video";

export default function SoloProgramming() {
  return (
    <div className="grid h-full grid-cols-[509px_1411px]">
      <div className="flex flex-col justify-start">
        <OneUpVideo size="sidebar-solo" />
      </div>
      <div className="bg-transparent w-full aspect-[16/10]"></div>
    </div>
  );
}
