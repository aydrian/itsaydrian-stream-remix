import type { LoaderFunctionArgs } from "@remix-run/node";

import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import ControlRoomLogo from "~/images/control-room-logo.svg";
import env from "~/utils/env.server";
import {
  scheduleToJSON,
  streamToJSON,
  twitch,
  videoToJSON
} from "~/utils/twitch.server";

const { TWITCH_USER_ID } = env;

export const loader = async (_args: LoaderFunctionArgs) => {
  const [hStream, { data: hSchedule }, { data: videoData }] = await Promise.all(
    [
      twitch.streams.getStreamByUserId(TWITCH_USER_ID),
      twitch.schedule.getSchedule(TWITCH_USER_ID, {
        limit: 1, // Get next show
        startDate: new Date().toJSON()
      }),
      twitch.videos.getVideosByUser(TWITCH_USER_ID, {
        limit: 1,
        orderBy: "time"
      })
    ]
  );
  const [hVideo] = videoData;
  const schedule = scheduleToJSON(hSchedule);
  const stream = await streamToJSON(hStream);
  const video = videoToJSON(hVideo);
  return json({ schedule, stream, video });
};

export default function Index() {
  const { stream } = useLoaderData<typeof loader>();
  return (
    <div className="flex min-h-[100svh] w-full flex-col items-start justify-center bg-gradient-to-r from-cyan-500 to-green-500 pt-12 md:items-center md:pt-0">
      <img alt="Control Room" className="h-auto w-1/3" src={ControlRoomLogo} />
      <h1 className="text-6xl font-bold">Control Room</h1>
      {stream ? (
        <h2>
          {" "}
          Live now! Go to{" "}
          <a
            href={`https://twitch.tv/${stream.userName}`}
          >{`https://twitch.tv/${stream.userName}`}</a>
        </h2>
      ) : null}
    </div>
  );
}
