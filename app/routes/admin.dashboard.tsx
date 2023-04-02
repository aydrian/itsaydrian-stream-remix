import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authenticator } from "~/services/auth.server";
import { getEventSubSubscriptionsForUser } from "~/services/twitch.server";

export const loader = async ({ request }: LoaderArgs) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/admin/login"
  });

  const subscriptions = await getEventSubSubscriptionsForUser(user.id);

  return json({ user, subscriptions });
};

export default function AdminDashboard() {
  const { user, subscriptions } = useLoaderData<typeof loader>();
  return (
    <section>
      <h1>Dashboard</h1>
      <pre>{JSON.stringify(user, null, 2)}</pre>
      <pre>{JSON.stringify(subscriptions, null, 2)}</pre>
    </section>
  );
}
