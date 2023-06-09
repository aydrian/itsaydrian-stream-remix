import { useForm } from "@conform-to/react";
import { parse } from "@conform-to/zod";
import {
  type ActionArgs,
  type LoaderArgs,
  json,
  redirect
} from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { z } from "zod";

import { Twitch } from "~/components/brand-logos";
import { Button, type ButtonProps } from "~/components/ui/button";
import { requireUserId } from "~/utils/auth.server";
import { twitchStateCookie } from "~/utils/cookies.server";
import { prisma } from "~/utils/db.server";
import env from "~/utils/env.server";
import { cn, generateRandomString } from "~/utils/misc";

const { TWITCH_CLIENT_ID, TWITCH_REDIRECT_URI } = env;

const DisconnectSchema = z.object({
  connectionId: z.string()
});

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await requireUserId(request);

  const state = generateRandomString(16);

  const searchParams = new URLSearchParams([
    ["response_type", "code"],
    ["client_id", TWITCH_CLIENT_ID],
    [
      "scope",
      "channel:manage:redemptions moderator:read:followers channel:read:subscriptions channel:manage:broadcast"
    ],
    ["redirect_uri", TWITCH_REDIRECT_URI],
    ["state", state]
  ]);

  return redirect(`https://id.twitch.tv/oauth2/authorize?${searchParams}`, {
    headers: {
      "Set-Cookie": await twitchStateCookie.serialize({
        state,
        userId
      })
    }
  });
};

export const action = async ({ request }: ActionArgs) => {
  await requireUserId(request);
  const formData = await request.formData();
  const submission = parse(formData, {
    acceptMultipleErrors: () => true,
    schema: DisconnectSchema
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

export function TwitchConnect() {
  const twitchFetcher = useFetcher<typeof loader>();

  const [form] = useForm({
    id: " twitch-connect-form"
  });

  return (
    <twitchFetcher.Form action="/resources/twitch" method="GET" {...form.props}>
      <TwitchButton state={twitchFetcher.state} />
    </twitchFetcher.Form>
  );
}

export function TwitchDisconnect({ connectionId }: { connectionId: string }) {
  const twitchFetcher = useFetcher<typeof action>();

  const [form] = useForm({
    id: "twitch-disconnect-form"
  });

  return (
    <twitchFetcher.Form
      action="/resources/twitch"
      method="POST"
      {...form.props}
    >
      <input name="connectionId" type="hidden" value={connectionId} />
      <TwitchButton state={twitchFetcher.state} title="Disconnect" />
    </twitchFetcher.Form>
  );
}

interface TwitchButtonProps extends ButtonProps {
  state?: "idle" | "loading" | "submitting";
  title?: string;
}

export function TwitchButton({
  disabled,
  state = "idle",
  title = "Connect",
  ...props
}: TwitchButtonProps) {
  return (
    <Button
      {...props}
      className={cn(props.className, "bg-[#9146FF] py-6 text-white")}
      disabled={disabled || state !== "idle"}
    >
      <Twitch className="mr-2 h-6 w-auto" />
      <span>{title}</span>
    </Button>
  );
}
