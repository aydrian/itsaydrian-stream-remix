import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { type ActionFunctionArgs, json } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { z } from "zod";

import { ErrorList, Field, SubmitButton } from "~/components/form";
import { changePassword } from "~/utils/auth.server";

const ChangePwdSchema = z
  .object({
    confirmPassword: z.string({
      required_error: "Please confirm your new password"
    }),
    email: z.string().email(),
    newPassword: z
      .string({ required_error: "New Password is required" })
      .min(6, "Password must be at least 6 characters long"),
    password: z.string({ required_error: "Current Password is required" })
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
  });

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const submission = parseWithZod(formData, {
    schema: ChangePwdSchema
  });

  if (submission.status !== "success") {
    return json(submission.reply(), {
      status: submission.status === "error" ? 400 : 200
    });
  }

  const { email, newPassword, password } = submission.value;

  try {
    await changePassword(email, password, newPassword);
  } catch (error) {
    if (error instanceof Error) {
      return json(
        submission.reply({
          formErrors: [error.message]
        }),
        { status: 400 }
      );
    }
    throw error;
  }

  return json(submission.reply({ resetForm: true }));
}

export function ChangePwdForm({ email }: { email: string }) {
  const changePwdFetcher = useFetcher<typeof action>();

  const [form, fields] = useForm({
    constraint: getZodConstraint(ChangePwdSchema),
    defaultValue: { email },
    id: "form-change-pwd-form",
    lastResult: changePwdFetcher.data,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: ChangePwdSchema });
    },
    shouldRevalidate: "onBlur"
  });

  return (
    <changePwdFetcher.Form
      action="/auth/form/changePwd"
      method="POST"
      {...getFormProps(form)}
      className="mb-8 flex flex-col sm:mb-4"
    >
      {form.status === "success" ? (
        <div className="mb-2 text-sm text-green-700">
          Password successfully changed
        </div>
      ) : null}
      <input {...getInputProps(fields.email, { type: "hidden" })} />
      <Field
        errors={fields.password.errors}
        inputProps={getInputProps(fields.password, { type: "password" })}
        labelProps={{ children: "Password", htmlFor: fields.password.id }}
      />
      <Field
        errors={fields.newPassword.errors}
        inputProps={getInputProps(fields.newPassword, { type: "password" })}
        labelProps={{
          children: "New Password",
          htmlFor: fields.newPassword.id
        }}
      />
      <Field
        errors={fields.confirmPassword.errors}
        inputProps={getInputProps(fields.confirmPassword, { type: "password" })}
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
