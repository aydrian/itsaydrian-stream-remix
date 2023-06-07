import { json, redirect, type LoaderArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { getUserEventSubSubscriptions } from "~/utils/twitch.server";

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await requireUserId(request);
  const connection = await prisma.connection.findFirst({
    where: { provider: "twitch", userId: userId },
    select: {
      id: true,
      providerAccountId: true,
      providerDisplayName: true,
      accessToken: true,
      refreshToken: true
    }
  });
  if (!connection) {
    return redirect("/admin/settings/profile");
  }
  const eventSubSubscriptions = await getUserEventSubSubscriptions(
    connection?.providerAccountId
  );
  return json({ eventSubSubscriptions });
};

export default function TwitchSettings() {
  const { eventSubSubscriptions } = useLoaderData<typeof loader>();
  return (
    <>
      <h2 className="text-3xl font-bold tracking-tight">Twitch Settings</h2>
      <Card>
        <CardHeader>
          <CardTitle>EventSub Subscriptions</CardTitle>
          <CardContent>
            <table className="w-full">
              <thead>
                <th>Status</th>
                <th>Type</th>
                <th>Version</th>
                <th>Method</th>
                <th>Endpoint</th>
              </thead>
              <tbody className="text-sm">
                {eventSubSubscriptions.map((sub) => {
                  return (
                    <tr key={sub.id}>
                      <td title={sub.status}>
                        {sub.status === "enabled" ? "✅" : "⚠️"}
                      </td>
                      <td>{sub.type}</td>
                      <td>{sub.version}</td>
                      <td>{sub.transport.method}</td>
                      <td>{sub.transport.callback}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </CardHeader>
      </Card>
    </>
  );
}
