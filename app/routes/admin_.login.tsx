import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { authenticator } from "~/services/auth.server";

export const loader = async ({ request }: LoaderArgs) => {
  // If the user is already authenticated redirect to /dashboard directly
  return await authenticator.isAuthenticated(request, {
    successRedirect: "/admin/dashboard"
  });
};

// Normally this will redirect user to Twitch auth page
export const action = async ({ request }: ActionArgs) => {
  await authenticator.authenticate("twitch", request, {
    successRedirect: "/admin/dashboard" // Destination in case the user is already logged in
  });
};
