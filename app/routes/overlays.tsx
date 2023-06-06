import { useEventSource } from "remix-utils";

export default function Overlays() {
  const redeemData = useEventSource("/resources/twitch/eventsub", {
    event: "redeem-channelpoints"
  });

  const redemption = redeemData ? JSON.parse(redeemData) : null;
  return (
    <div>
      <h1>Overlays</h1>
      {redemption ? <pre>{JSON.stringify(redemption, null, 2)}</pre> : null}
    </div>
  );
}
