import { conform, useForm } from "@conform-to/react";
import { getFieldsetConstraint, parse } from "@conform-to/zod";
import { type Guest } from "@prisma/client";
import { type ActionArgs, json, redirect } from "@remix-run/node";
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

export async function action({ request }: ActionArgs) {
  await requireUserId(request);
  const formData = await request.formData();
  const submission = parse(formData, {
    schema: GuestEditorSchema
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
    return json({ status: "idle", submission } as const);
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

  return redirect(`../`);
}

export function GuestEditor({ guest }: { guest?: Guest }) {
  const fetcher = useFetcher<typeof action>();

  const [form, fields] = useForm({
    constraint: getFieldsetConstraint(GuestEditorSchema),
    defaultValue: guest,
    id: "guest-editor",
    lastSubmission: fetcher.data?.submission,
    onValidate({ formData }) {
      return parse(formData, { schema: GuestEditorSchema });
    },
    shouldRevalidate: "onBlur"
  });

  return (
    <fetcher.Form
      action="/resources/guest-editor"
      method="post"
      {...form.props}
      className="flex flex-col"
    >
      <input {...conform.input(fields.id, { type: "hidden" })} />
      <Field
        errors={fields.firstName.errors}
        inputProps={conform.input(fields.firstName)}
        labelProps={{ children: "First Name", htmlFor: fields.firstName.id }}
      />
      <Field
        errors={fields.lastName.errors}
        inputProps={conform.input(fields.lastName)}
        labelProps={{ children: "Last Name", htmlFor: fields.lastName.id }}
      />
      <Field
        errors={fields.title.errors}
        inputProps={conform.input(fields.title)}
        labelProps={{ children: "Title", htmlFor: fields.title.id }}
      />
      <Field
        errors={fields.company.errors}
        inputProps={conform.input(fields.company)}
        labelProps={{ children: "Company", htmlFor: fields.company.id }}
      />
      <Field
        errors={fields.twitter.errors}
        inputProps={conform.input(fields.twitter)}
        labelProps={{ children: "Twitter", htmlFor: fields.twitter.id }}
      />
      <Field
        errors={fields.avatarUrl.errors}
        inputProps={conform.input(fields.avatarUrl)}
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
