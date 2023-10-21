import { Outlet } from "@remix-run/react";

import { ScreenContainer } from "~/components/screen-container";
import { useOptions } from "~/routes/scenes+/_layout";
import { useEpisode } from "~/routes/scenes+/me+/_layout";

export default function ProgrammingLayout() {
  const { guests } = useEpisode();
  const { screenSize, showGuides } = useOptions();

  if (guests.length < 1) {
    return <div>No Guests found.</div>;
  }

  return (
    // <div className="grid h-full grid-cols-[auto_1408px]">
    <div className="flex h-full w-full">
      <div className="flex h-full w-full flex-col items-stretch justify-center">
        <Outlet />
      </div>
      <ScreenContainer screenSize={screenSize} showGuides={showGuides} />
    </div>
  );
}
