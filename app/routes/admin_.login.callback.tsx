import type { LoaderFunction } from "@remix-run/node";
import { authenticator } from "~/services/auth.server";

// This will be called after twitch auth page
export const loader: LoaderFunction = async ({ request }) => {
  await authenticator.authenticate("twitch", request, {
    successRedirect: "/admin/dashboard",
    failureRedirect: "/admin/login/failure"
  });
};
