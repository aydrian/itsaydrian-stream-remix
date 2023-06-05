import { redirect, type LoaderArgs } from "@remix-run/node";
import invariant from "tiny-invariant";
import { getUserProfile, requestAccessToken } from "~/utils/spotify.server";
import { spotifyStateCookie } from "~/utils/cookies.server";
import { prisma } from "~/utils/db.server";

export const loader = async ({ request }: LoaderArgs) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  invariant(typeof code === "string", "Expected code to not be null.");
  const state = url.searchParams.get("state");

  const cookie = await spotifyStateCookie.parse(request.headers.get("Cookie"));

  if (state !== cookie.state) {
    console.log("Spotify state doesn't match.", state, cookie.state);
  }

  const { access_token, token_type, refresh_token, scope, expires_in } =
    await requestAccessToken(code);

  const { id, display_name } = await getUserProfile(access_token);

  await prisma.connection.create({
    data: {
      userId: cookie.userId,
      provider: "spotify",
      providerAccountId: id,
      providerDisplayName: display_name,
      type: "oauth",
      accessToken: access_token,
      refreshToken: refresh_token,
      tokenType: token_type,
      scope,
      expiresAt: expires_in
    }
  });
  return redirect(`/admin/settings/profile`, {
    headers: { "Set-Cookie": await spotifyStateCookie.serialize(null) }
  });
};
