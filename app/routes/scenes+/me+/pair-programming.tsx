import { TwoUpVideo } from "~/components/two-up-video";

export default function PairProgramming() {
  return (
    <div className="grid h-full grid-cols-[509px_1411px]">
      <div className="flex flex-col justify-end">
        <TwoUpVideo size="sidebar" />
      </div>
      <div className="aspect-[16/10] w-full bg-transparent"></div>
    </div>
  );
}
