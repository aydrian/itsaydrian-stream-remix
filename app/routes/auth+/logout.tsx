import type { LoaderFunctionArgs } from "@remix-run/node";

import { authenticator, DEFAULT_FAILURE_REDIRECT } from "~/utils/auth.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticator.logout(request, { redirectTo: DEFAULT_FAILURE_REDIRECT });
};
