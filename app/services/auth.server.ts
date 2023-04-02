import { Authenticator } from "remix-auth";
import { TwitchStrategy } from "remix-auth-twitch";
import invariant from "tiny-invariant";
import { sessionStorage } from "~/services/session.server";

type User = {
  id: string;
  screen_name: string;
  name: string;
  email?: string;
  accessToken: string;
  profile_image_url: string;
};

export let authenticator = new Authenticator<User>(sessionStorage);

const twitchClientId = process.env.TWITCH_CLIENT_ID;
invariant(
  typeof twitchClientId === "string",
  "TWITCH_API_CLIENT must be provided"
);
const twitchClientSecret = process.env.TWITCH_CLIENT_SECRET;
invariant(
  typeof twitchClientSecret === "string",
  "TWITCH_CLIENT_SECRET must be provided"
);
const twitchStrategy = new TwitchStrategy(
  {
    clientId: twitchClientId,
    clientSecret: twitchClientSecret,
    callbackURL: "http://localhost:3000/admin/login/callback",
    includeEmail: true
  },
  async ({ profile, token }) => {
    return {
      id: profile.id,
      screen_name: profile.display_name,
      name: profile.login,
      email: profile.email,
      accessToken: token.access_token,
      profile_image_url: profile.profile_image_url
    };
  }
);
authenticator.use(twitchStrategy, "twitch");
