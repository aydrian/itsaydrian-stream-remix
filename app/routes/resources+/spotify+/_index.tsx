import { useForm } from "@conform-to/react";
import {
  redirect,
  type LoaderArgs,
  type ActionArgs,
  json
} from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { requireUserId } from "~/utils/auth.server";
import { cn, generateRandomString } from "~/utils/misc";
import { spotifyStateCookie } from "~/utils/cookies.server";
import { prisma } from "~/utils/db.server";
import { z } from "zod";
import { parse } from "@conform-to/zod";
import { Spotify } from "~/components/brand-logos";
import env from "~/utils/env.server";
import { Button, type ButtonProps } from "~/components/ui/button";

const { SPOTIFY_CLIENT_ID, SPOTIFY_REDIRECT_URI } = env;

const DisconnectSchema = z.object({
  connectionId: z.string()
});

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await requireUserId(request);

  const state = generateRandomString(16);

  const searchParams = new URLSearchParams([
    ["response_type", "code"],
    ["client_id", SPOTIFY_CLIENT_ID],
    ["scope", "user-read-private user-read-email"],
    ["redirect_uri", SPOTIFY_REDIRECT_URI],
    ["state", state]
  ]);

  return redirect(`https://accounts.spotify.com/authorize?${searchParams}`, {
    headers: {
      "Set-Cookie": await spotifyStateCookie.serialize({
        state,
        userId: userId
      })
    }
  });
};

export const action = async ({ request }: ActionArgs) => {
  await requireUserId(request);
  const formData = await request.formData();
  const submission = parse(formData, {
    schema: DisconnectSchema,
    acceptMultipleErrors: () => true
  });

  if (!submission.value) {
    return json(
      {
        status: "error",
        submission
      } as const,
      { status: 400 }
    );
  }
  if (submission.intent !== "submit") {
    return json({ status: "success", submission } as const);
  }

  const { connectionId } = submission.value;

  await prisma.connection.delete({ where: { id: connectionId } });

  return redirect(`/admin/settings/profile`);
};

export function SpotifyConnect() {
  const spotifyFetcher = useFetcher<typeof loader>();

  const [form] = useForm({
    id: "spotify-connect-form"
  });

  return (
    <spotifyFetcher.Form
      method="GET"
      action="/resources/spotify"
      {...form.props}
    >
      <SpotifyButton state={spotifyFetcher.state} />
    </spotifyFetcher.Form>
  );
}

export function SpotifyDisconnect({ connectionId }: { connectionId: string }) {
  const spotifyFetcher = useFetcher<typeof action>();

  const [form] = useForm({
    id: "spotify-disconnect-form"
  });

  return (
    <spotifyFetcher.Form
      method="POST"
      action="/resources/spotify"
      {...form.props}
    >
      <input type="hidden" name="connectionId" value={connectionId} />
      <SpotifyButton state={spotifyFetcher.state} title="Disconnect" />
    </spotifyFetcher.Form>
  );
}

interface SpotifyButtonProps extends ButtonProps {
  title?: string;
  state?: "idle" | "submitting" | "loading";
}

export function SpotifyButton({
  state = "idle",
  title = "Connect",
  disabled,
  ...props
}: SpotifyButtonProps) {
  return (
    <Button
      {...props}
      className={cn(props.className, "bg-[#1db954] py-6 text-white")}
      disabled={disabled || state !== "idle"}
    >
      <Spotify className="mr-2 h-6 w-auto" />
      <span>{title}</span>
    </Button>
  );
}
