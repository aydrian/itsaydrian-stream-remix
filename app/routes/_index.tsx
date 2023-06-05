import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  scheduleToJSON,
  streamToJSON,
  twitch,
  videoToJSON
} from "~/utils/twitch.server";
import env from "~/utils/env.server";

const { TWITCH_USER_ID } = env;

export const loader = async (_args: LoaderArgs) => {
  const [hStream, { data: hSchedule }, { data: videoData }] = await Promise.all(
    [
      twitch.streams.getStreamByUserId(TWITCH_USER_ID),
      twitch.schedule.getSchedule(TWITCH_USER_ID, {
        startDate: new Date().toJSON(),
        limit: 1 // Get next show
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
  return json({ stream, schedule, video });
};

export default function Index() {
  const { stream } = useLoaderData<typeof loader>();
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <h1>ItsAydrian Stream (Remix Edition)</h1>
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
