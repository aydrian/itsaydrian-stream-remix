import { conform, useForm } from "@conform-to/react";
import { getFieldsetConstraint, parse } from "@conform-to/zod";
import { type DataFunctionArgs, json } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { AuthorizationError } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import { z } from "zod";

import { ErrorList, Field, SubmitButton } from "~/components/form";
import { DEFAULT_SUCCESS_REDIRECT, authenticator } from "~/utils/auth.server";
import { redirectToCookie } from "~/utils/cookies.server";

const LoginFormSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Must be a valid email"),
  password: z
    .string({ required_error: "Password is required" })
    .min(6, "Password must be at least 6 characters long")
});

export const action = async ({ request }: DataFunctionArgs) => {
  const formData = await request.formData();
  const submission = parse(formData, {
    schema: LoginFormSchema
  });
  if (!submission.value || submission.intent !== "submit") {
    return json(
      {
        status: "error",
        submission
      } as const,
      { status: 400 }
    );
  }
  const redirectTo =
    (await redirectToCookie.parse(request.headers.get("Cookie"))) ??
    DEFAULT_SUCCESS_REDIRECT;

  try {
    await authenticator.authenticate(FormStrategy.name, request, {
      context: { formData },
      successRedirect: redirectTo,
      throwOnError: true
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return json(
        {
          status: "error",
          submission: {
            ...submission,
            error: {
              "": [error.message]
            }
          }
        } as const,
        { status: 400 }
      );
    }
    throw error;
  }

  return json({ status: "success", submission } as const);
};

export function FormLoginForm({ formError }: { formError?: null | string }) {
  const loginFetcher = useFetcher<typeof action>();

  const [form, fields] = useForm({
    constraint: getFieldsetConstraint(LoginFormSchema),
    id: "form-login-form",
    lastSubmission: loginFetcher.data?.submission,
    onValidate({ formData }) {
      return parse(formData, { schema: LoginFormSchema });
    },
    shouldRevalidate: "onBlur"
  });

  return (
    <loginFetcher.Form
      action="/auth/form"
      method="post"
      {...form.props}
      className="mb-8 flex flex-col sm:mb-4"
    >
      <Field
        errors={fields.email.errors}
        inputProps={{ ...conform.input(fields.email) }}
        labelProps={{ children: "Email", htmlFor: fields.email.id }}
      />
      <Field
        errors={fields.password.errors}
        inputProps={{ ...conform.input(fields.password), type: "password" }}
        labelProps={{ children: "Password", htmlFor: fields.password.id }}
      />
      <ErrorList errors={formError ? [formError] : []} />
      <ErrorList errors={form.errors} id={form.errorId} />
      <SubmitButton
        className="mt-4 px-6 py-2"
        state={loginFetcher.state}
        type="submit"
      >
        Login
      </SubmitButton>
    </loginFetcher.Form>
  );
}

const ChangePwdSchema = z
  .object({
    confirmPassword: z.string({
      required_error: "Please confirm your new password"
    }),
    newPassword: z
      .string({ required_error: "New Password is required" })
      .min(6, "Password must be at least 6 characters long"),
    password: z.string({ required_error: "Current Password is required" }),
    userId: z.string()
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
  });

export function ChangePwdForm({ userId }: { userId: string }) {
  const changePwdFetcher = useFetcher<typeof action>();

  const [form, fields] = useForm({
    constraint: getFieldsetConstraint(ChangePwdSchema),
    id: "form-change-pwd-form",
    lastSubmission: changePwdFetcher.data?.submission,
    onValidate({ formData }) {
      return parse(formData, { schema: LoginFormSchema });
    },
    shouldRevalidate: "onBlur"
  });

  return (
    <changePwdFetcher.Form
      action="/auth/form"
      method="POST"
      {...form.props}
      className="mb-8 flex flex-col sm:mb-4"
    >
      <input {...conform.input(fields.userId, { type: "hidden" })} />
      <Field
        errors={fields.password.errors}
        inputProps={{ ...conform.input(fields.password, { type: "password" }) }}
        labelProps={{ children: "Password", htmlFor: fields.password.id }}
      />
      <Field
        errors={fields.newPassword.errors}
        inputProps={{
          ...conform.input(fields.newPassword, { type: "password" })
        }}
        labelProps={{
          children: "New Password",
          htmlFor: fields.newPassword.id
        }}
      />
      <Field
        errors={fields.confirmPassword.errors}
        inputProps={{
          ...conform.input(fields.confirmPassword, { type: "password" })
        }}
        labelProps={{
          children: "Confirm Password",
          htmlFor: fields.confirmPassword.id
        }}
      />
      <ErrorList errors={form.errors} id={form.errorId} />
      <SubmitButton
        className="mt-4 px-6 py-2"
        state={changePwdFetcher.state}
        type="submit"
      >
        Submit
      </SubmitButton>
    </changePwdFetcher.Form>
  );
}
