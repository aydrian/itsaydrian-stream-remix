import type { LoaderFunctionArgs } from "@remix-run/node";

import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { Icon } from "~/components/icon";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import ControlRoomLogo from "~/images/control-room-logo.svg";
import { FormLoginForm } from "~/routes/auth+/form";
import { authenticator } from "~/utils/auth.server";
import { redirectToCookie } from "~/utils/cookies.server";
import { commitSession, getSession } from "~/utils/session.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticator.isAuthenticated(request, {
    successRedirect: "/admin/dashboard"
  });
  const url = new URL(request.url);
  const redirectTo = url.searchParams.get("redirectTo");
  const loginMessage = url.searchParams.get("loginMessage");

  let headers = new Headers();
  if (redirectTo) {
    headers.append("Set-Cookie", await redirectToCookie.serialize(redirectTo));
  }
  const session = await getSession(request.headers.get("cookie"));
  const error = session.get(authenticator.sessionErrorKey);
  let errorMessage: null | string = null;
  if (typeof error?.message === "string") {
    errorMessage = error.message;
  }
  headers.append("Set-Cookie", await commitSession(session));

  return json({ formError: errorMessage, loginMessage }, { headers });
};

export default function AdminIndex() {
  const data = useLoaderData<typeof loader>();
  return (
    <main className="flex h-screen flex-col justify-evenly bg-[#f5f5f5] md:flex-row">
      <div className="flex basis-1/4 flex-col items-center justify-center gap-2 md:basis-1/2">
        <img
          alt="Control Room"
          className="h-auto w-1/2"
          src={ControlRoomLogo}
        />
        <h1 className="text-6xl font-bold">Control Room</h1>
      </div>
      <div className="flex basis-3/4 items-start justify-center bg-gradient-to-r from-cyan-500 to-green-500 pt-12 md:basis-1/2 md:items-center md:pt-0">
        <Card className="w-3/4">
          <CardHeader>
            <CardTitle>Login</CardTitle>
          </CardHeader>
          <CardContent>
            {data.loginMessage ? (
              <div className="text-sm text-red-500">{data.loginMessage}</div>
            ) : null}
            <FormLoginForm formError={data.formError} />
          </CardContent>
        </Card>
      </div>
      <a
        className="absolute right-4 top-4"
        href="https://github.com/aydrian/roach-mart"
        rel="noreferrer"
        target="_blank"
      >
        <Icon className="h-8 w-8" name="github" />
        <span className="sr-only">Control Room GitHub Repository</span>
      </a>
    </main>
  );
}
