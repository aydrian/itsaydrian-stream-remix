import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { type Guest } from "@prisma/client";
import { type ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { Link, useFetcher } from "@remix-run/react";
import { z } from "zod";

import { Field, SubmitButton } from "~/components/form";
import { Button } from "~/components/ui/button";
import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";

const GuestEditorSchema = z.object({
  avatarUrl: z.string().optional(),
  company: z.string().optional(),
  firstName: z.string({ required_error: "First Name is required" }),
  id: z.string().optional(),
  lastName: z.string({ required_error: "Last Name is required" }),
  title: z.string().optional(),
  twitter: z.string().optional(),
  userId: z.string().optional()
});

export async function action({ request }: ActionFunctionArgs) {
  await requireUserId(request);
  const formData = await request.formData();
  const submission = parseWithZod(formData, {
    schema: GuestEditorSchema
  });

  if (submission.status !== "success") {
    return json(submission.reply(), { status: 400 });
  }

  const { id, ...data } = submission.value;

  if (id) {
    await prisma.guest.update({
      data: { ...data },
      select: { id: true },
      where: { id }
    });
  } else {
    await prisma.guest.create({
      data: { ...data },
      select: { id: true }
    });
  }

  return redirect(`/console/guests`);
}

export function GuestEditor({ guest }: { guest?: Guest }) {
  const fetcher = useFetcher<typeof action>();

  const [form, fields] = useForm({
    defaultValue: guest,
    id: "guest-editor",
    lastResult: fetcher.data,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: GuestEditorSchema });
    },
    shouldRevalidate: "onBlur"
  });

  return (
    <fetcher.Form
      action="/resources/guest-editor"
      method="post"
      {...getFormProps(form)}
      className="flex flex-col"
    >
      <input {...getInputProps(fields.id, { type: "hidden" })} />
      <Field
        errors={fields.firstName.errors}
        inputProps={getInputProps(fields.firstName, { type: "text" })}
        labelProps={{ children: "First Name", htmlFor: fields.firstName.id }}
      />
      <Field
        errors={fields.lastName.errors}
        inputProps={getInputProps(fields.lastName, { type: "text" })}
        labelProps={{ children: "Last Name", htmlFor: fields.lastName.id }}
      />
      <Field
        errors={fields.title.errors}
        inputProps={getInputProps(fields.title, { type: "text" })}
        labelProps={{ children: "Title", htmlFor: fields.title.id }}
      />
      <Field
        errors={fields.company.errors}
        inputProps={getInputProps(fields.company, { type: "text" })}
        labelProps={{ children: "Company", htmlFor: fields.company.id }}
      />
      <Field
        errors={fields.twitter.errors}
        inputProps={getInputProps(fields.twitter, { type: "text" })}
        labelProps={{ children: "Twitter", htmlFor: fields.twitter.id }}
      />
      <Field
        errors={fields.avatarUrl.errors}
        inputProps={getInputProps(fields.avatarUrl, { type: "text" })}
        labelProps={{ children: "Avatar", htmlFor: fields.avatarUrl.id }}
      />
      <div className="mt-2 flex w-full gap-2">
        <SubmitButton>Submit</SubmitButton>
        <Button asChild variant="secondary">
          <Link to="../">Cancel</Link>
        </Button>
      </div>
    </fetcher.Form>
  );
}
