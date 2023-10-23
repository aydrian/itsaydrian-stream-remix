import { type User } from "@prisma/client";
import bcrypt from "bcryptjs";
import { Authenticator, AuthorizationError } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import invariant from "tiny-invariant";

import { prisma } from "~/utils/db.server";
import { sessionStorage } from "~/utils/session.server";

export const DEFAULT_FAILURE_REDIRECT = "/auth/login";
export const DEFAULT_SUCCESS_REDIRECT = "/console";

export const authenticator = new Authenticator<string>(sessionStorage);

authenticator.use(
  new FormStrategy(async ({ form }) => {
    const email = form.get("email");
    const password = form.get("password");

    invariant(typeof email === "string", "email must be a string");
    invariant(typeof password === "string", "password must be a string");

    const userId = await verifyLogin(email, password);
    if (!userId) {
      throw new AuthorizationError("Email/Password combination is incorrect");
    }
    return userId;
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
    failureRedirect: `${DEFAULT_FAILURE_REDIRECT}?${searchParams}`
  });
  return userId;
};

export async function verifyLogin(email: User["email"], password: string) {
  const userWithPassword = await prisma.user.findUnique({
    select: { id: true, passwordHash: true },
    where: { email }
  });

  if (!userWithPassword || !userWithPassword.passwordHash) {
    return null;
  }

  const isValid = await bcrypt.compare(password, userWithPassword.passwordHash);

  if (!isValid) {
    return null;
  }

  return userWithPassword.id;
}

export async function changePassword(
  email: User["email"],
  password: string,
  newPassword: string
) {
  const userId = await verifyLogin(email, password);
  if (!userId) {
    throw new Error("Password incorrect.");
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  try {
    await prisma.user.update({
      data: { passwordHash },
      select: { id: true },
      where: { id: userId }
    });
  } catch (err) {
    console.error(`Error changing password for ${email}: `, err);
    throw new Error("Unable to change password. Please try again.");
  }
}
