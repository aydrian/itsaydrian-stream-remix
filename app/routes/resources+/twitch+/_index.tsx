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
import { cn, generateRandomString } from "~/utils/misc";
import invariant from "tiny-invariant";
import { twitchStateCookie } from "~/utils/cookies.server";
import { prisma } from "~/utils/db.server";
import { z } from "zod";
import { parse } from "@conform-to/zod";
import { Twitch } from "~/components/brand-logos";

const DisconnectSchema = z.object({
  connectionId: z.string()
});

export const loader = async ({ request }: LoaderArgs) => {
  const user = await requireUser(request);
  const client_id = process.env.TWITCH_CLIENT_ID;
  const redirect_uri = process.env.TWITCH_REDIRECT_URI;
  invariant(typeof client_id === "string", "TWITCH_CLIENT_ID must be set");
  invariant(
    typeof redirect_uri === "string",
    "TWITCH_REDIRECT_URI must be set"
  );

  const state = generateRandomString(16);

  const searchParams = new URLSearchParams([
    ["response_type", "code"],
    ["client_id", client_id],
    [
      "scope",
      "channel:manage:redemptions moderator:read:followers channel:read:subscriptions channel:manage:broadcast"
    ],
    ["redirect_uri", redirect_uri],
    ["state", state]
  ]);

  return redirect(`https://id.twitch.tv/oauth2/authorize?${searchParams}`, {
    headers: {
      "Set-Cookie": await twitchStateCookie.serialize({
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

export function TwitchConnect() {
  const twitchFetcher = useFetcher<typeof loader>();

  const [form] = useForm({
    id: " twitch-connect-form"
  });

  return (
    <twitchFetcher.Form method="GET" action="/resources/twitch" {...form.props}>
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
      method="POST"
      action="/resources/twitch"
      {...form.props}
    >
      <input type="hidden" name="connectionId" value={connectionId} />
      <TwitchButton state={twitchFetcher.state} title="Disconnect" />
    </twitchFetcher.Form>
  );
}

interface TwitchButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  title?: string;
  state?: "idle" | "submitting" | "loading";
}

export function TwitchButton({
  state = "idle",
  title = "Connect",
  disabled,
  ...props
}: TwitchButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        props.className,
        "inline-flex items-center rounded bg-[#9146FF] px-4 py-2 font-semibold text-white duration-300 hover:shadow-lg hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-75"
      )}
      disabled={disabled || state !== "idle"}
    >
      <Twitch className="mr-2 h-8 w-auto" />
      <span>{title}</span>
    </button>
  );
}
