import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().nonempty(),
  SESSION_SECRET: z.string().nonempty(),
  SPOTIFY_CLIENT_ID: z.string().nonempty(),
  SPOTIFY_CLIENT_SECRET: z.string().nonempty(),
  SPOTIFY_REDIRECT_URI: z.string().nonempty(),
  TWITCH_CLIENT_ID: z.string().nonempty(),
  TWITCH_CLIENT_SECRET: z.string().nonempty(),
  TWITCH_REDIRECT_URI: z.string().nonempty(),
  TWITCH_SIGNING_SECRET: z.string().nonempty(),
  TWITCH_USER_ID: z.string().nonempty()
});

const env = envSchema.parse(process.env);
export default env;
