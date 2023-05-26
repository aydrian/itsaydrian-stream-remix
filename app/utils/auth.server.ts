import type { UserWithoutPassword } from "~/models/user.server";
import { Authenticator, AuthorizationError } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import { sessionStorage } from "~/utils/session.server";
import invariant from "tiny-invariant";
import { verifyLogin } from "~/models/user.server";

export const authenticator = new Authenticator<UserWithoutPassword>(
  sessionStorage
);

authenticator.use(
  new FormStrategy(async ({ form }) => {
    const email = form.get("email");
    const password = form.get("password");

    invariant(typeof email === "string", "email must be a string");
    invariant(typeof password === "string", "password must be a string");

    const user = await verifyLogin(email, password);
    if (!user) {
      throw new AuthorizationError(
        "Username/Password combination is incorrect"
      );
    }
    return user;
  }),
  FormStrategy.name
);

export const requireUser = async (
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) => {
  const searchParams = new URLSearchParams([
    ["redirectTo", redirectTo],
    ["loginMessage", "Please login to continue"]
  ]);
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: `/admin?${searchParams}`
  });
  return user;
};
