import { type LoaderFunctionArgs, redirect } from "@remix-run/node";
import invariant from "tiny-invariant";

import { twitchStateCookie } from "~/utils/cookies.server";
import { prisma } from "~/utils/db.server";
import { getUserProfile, requestAccessToken } from "~/utils/twitch.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  invariant(typeof code === "string", "Expected code to not be null.");
  const state = url.searchParams.get("state");

  const cookie = await twitchStateCookie.parse(request.headers.get("Cookie"));

  if (state !== cookie.state) {
    console.log("Twitch state doesn't match.", state, cookie.state);
  }

  const { access_token, expires_in, refresh_token, scope, token_type } =
    await requestAccessToken(code);

  const { display_name, id } = await getUserProfile(access_token);
  console.log({ display_name, id });

  await prisma.connection.create({
    data: {
      accessToken: access_token,
      expiresAt: expires_in,
      provider: "twitch",
      providerAccountId: id,
      providerDisplayName: display_name,
      refreshToken: refresh_token,
      scope: scope.join(" "),
      tokenType: token_type,
      type: "oauth",
      userId: cookie.userId
    }
  });
  return redirect(`/admin/settings/profile`, {
    headers: { "Set-Cookie": await twitchStateCookie.serialize(null) }
  });
};
