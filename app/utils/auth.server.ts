import { Authenticator, AuthorizationError } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import { sessionStorage } from "~/utils/session.server";
import invariant from "tiny-invariant";
import bcrypt from "bcryptjs";
import { prisma } from "~/utils/db.server";
import { type User } from "@prisma/client";

export const authenticator = new Authenticator<string>(sessionStorage);

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
    return user.id;
  }),
  FormStrategy.name
);

export const requireUserId = async (
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) => {
  const searchParams = new URLSearchParams([
    ["redirectTo", redirectTo],
    ["loginMessage", "Please login to continue"]
  ]);
  const userId = await authenticator.isAuthenticated(request, {
    failureRedirect: `/admin?${searchParams}`
  });
  return userId;
};

export async function verifyLogin(email: User["email"], password: string) {
  const userWithPassword = await prisma.user.findUnique({
    where: { email },
    select: { id: true, passwordHash: true }
  });

  if (!userWithPassword || !userWithPassword.passwordHash) {
    return null;
  }

  const isValid = await bcrypt.compare(password, userWithPassword.passwordHash);

  if (!isValid) {
    return null;
  }

  return { id: userWithPassword.id };
}
