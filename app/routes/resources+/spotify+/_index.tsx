import { getFormProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  json,
  redirect
} from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { z } from "zod";

import { Icon } from "~/components/icon";
import { Button, type ButtonProps } from "~/components/ui/button";
import { requireUserId } from "~/utils/auth.server";
import { spotifyStateCookie } from "~/utils/cookies.server";
import { prisma } from "~/utils/db.server";
import { cn, generateRandomString } from "~/utils/misc";

const DisconnectSchema = z.object({
  connectionId: z.string()
});

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);

  const state = generateRandomString(16);

  const searchParams = new URLSearchParams([
    ["response_type", "code"],
    ["client_id", process.env.SPOTIFY_CLIENT_ID],
    ["scope", "user-read-private user-read-email"],
    ["redirect_uri", process.env.SPOTIFY_REDIRECT_URI],
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

export const action = async ({ request }: ActionFunctionArgs) => {
  await requireUserId(request);
  const formData = await request.formData();
  const submission = parseWithZod(formData, {
    schema: DisconnectSchema
  });

  if (submission.status !== "success") {
    return json(submission.reply(), { status: 400 });
  }

  const { connectionId } = submission.value;

  await prisma.connection.delete({ where: { id: connectionId } });

  return redirect(`/console/settings/profile`);
};

export function SpotifyConnect() {
  const spotifyFetcher = useFetcher<typeof loader>();

  const [form] = useForm({
    id: "spotify-connect-form"
  });

  return (
    <spotifyFetcher.Form
      action="/resources/spotify"
      method="GET"
      {...getFormProps(form)}
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
      action="/resources/spotify"
      method="POST"
      {...getFormProps(form)}
    >
      <input name="connectionId" type="hidden" value={connectionId} />
      <SpotifyButton state={spotifyFetcher.state} title="Disconnect" />
    </spotifyFetcher.Form>
  );
}

interface SpotifyButtonProps extends ButtonProps {
  state?: "idle" | "loading" | "submitting";
  title?: string;
}

export function SpotifyButton({
  disabled,
  state = "idle",
  title = "Connect",
  ...props
}: SpotifyButtonProps) {
  return (
    <Button
      {...props}
      className={cn(props.className, "bg-[#1db954] py-6 text-white")}
      disabled={disabled || state !== "idle"}
    >
      <Icon className="mr-2 h-6 w-6" name="spotify" />
      <span>{title}</span>
    </Button>
  );
}
