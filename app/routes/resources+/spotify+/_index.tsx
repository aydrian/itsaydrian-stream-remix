import { useForm } from "@conform-to/react";
import {
  redirect,
  type LoaderArgs,
  type ActionArgs,
  json
} from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { type ButtonHTMLAttributes } from "react";
import { requireUser } from "~/utils/auth.server";
import { cn } from "~/utils/misc";
import invariant from "tiny-invariant";
import { generateRandomString } from "~/utils/spotify.server";
import { spotifyStateCookie } from "~/utils/cookies.server";
import { prisma } from "~/utils/db.server";
import { z } from "zod";
import { parse } from "@conform-to/zod";

const DisconnectSchema = z.object({
  connectionId: z.string()
});

export const loader = async ({ request }: LoaderArgs) => {
  const user = await requireUser(request);
  const client_id = process.env.SPOTIFY_CLIENT_ID;
  const redirect_uri = process.env.SPOTIFY_REDIRECT_URI;
  invariant(typeof client_id === "string", "SPOTIFY_CLIENT_ID must be set");
  invariant(
    typeof redirect_uri === "string",
    "SPOTIFY_REDIRECT_URI must be set"
  );

  const state = generateRandomString(16);

  const searchParams = new URLSearchParams([
    ["response_type", "code"],
    ["client_id", client_id],
    ["scope", "user-read-private user-read-email"],
    ["redirect_uri", redirect_uri],
    ["state", state]
  ]);

  return redirect(`https://accounts.spotify.com/authorize?${searchParams}`, {
    headers: {
      "Set-Cookie": await spotifyStateCookie.serialize({
        state,
        userId: user.id
      })
    }
  });
};

export const action = async ({ request }: ActionArgs) => {
  await requireUser(request);
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
      <SpotifyButton state={spotifyFetcher.state} className="mt-4" />
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
      <SpotifyButton
        state={spotifyFetcher.state}
        title="Disconnect"
        className="mt-4"
      />
    </spotifyFetcher.Form>
  );
}

interface SpotifyLoginButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  title?: string;
  state?: "idle" | "submitting" | "loading";
}

export function SpotifyButton({
  state = "idle",
  title = "Connect",
  disabled,
  ...props
}: SpotifyLoginButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        props.className,
        "inline-flex items-center rounded bg-[#1db954] px-4 py-2 font-semibold text-white duration-300 hover:shadow-lg hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-75"
      )}
      disabled={disabled || state !== "idle"}
    >
      <span>{title}</span>
    </button>
  );
}
