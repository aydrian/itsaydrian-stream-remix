import { getFormProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import {
  type ActionFunctionArgs,
  json,
  type LoaderFunctionArgs,
  redirect
} from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { z } from "zod";

import { Icon } from "~/components/icon";
import { Button, type ButtonProps } from "~/components/ui/button";
import { requireUserId } from "~/utils/auth.server";
import { twitchStateCookie } from "~/utils/cookies.server";
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
    ["client_id", process.env.TWITCH_CLIENT_ID],
    [
      "scope",
      "channel:manage:redemptions moderator:read:followers channel:read:subscriptions channel:manage:broadcast"
    ],
    ["redirect_uri", process.env.TWITCH_REDIRECT_URI],
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

export function TwitchConnect() {
  const twitchFetcher = useFetcher<typeof loader>();

  const [form] = useForm({
    id: "twitch-connect-form"
  });

  return (
    <twitchFetcher.Form
      action="/resources/twitch"
      method="GET"
      {...getFormProps(form)}
    >
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
      {...getFormProps(form)}
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
      <Icon className="mr-2 h-6 w-6" name="twitch" />
      <span>{title}</span>
    </Button>
  );
}
