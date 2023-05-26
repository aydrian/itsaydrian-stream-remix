import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { commitSession, getSession } from "~/utils/session.server";
import { authenticator } from "~/utils/auth.server";

import { redirectToCookie } from "~/utils/cookies.server";
import { FormLoginForm } from "~/routes/auth.form";

export const loader = async ({ request }: LoaderArgs) => {
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
  let errorMessage: string | null = null;
  if (typeof error?.message === "string") {
    errorMessage = error.message;
  }
  // TODO: Is this necessary?
  headers.append("Set-Cookie", await commitSession(session));

  return json({ loginMessage, formError: errorMessage }, { headers });
};

export default function AdminIndex() {
  const data = useLoaderData<typeof loader>();
  return (
    <main>
      <h3>Login</h3>
      {data.loginMessage ? (
        <div className="text-sm text-red-500">{data.loginMessage}</div>
      ) : null}
      <FormLoginForm formError={data.formError} />
    </main>
  );
}