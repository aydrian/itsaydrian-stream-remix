import {
  getFormProps,
  getInputProps,
  getTextareaProps,
  useForm
} from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { SceneCollection, type Show } from "@prisma/client";
import { type ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { Link, useFetcher } from "@remix-run/react";
import { z } from "zod";

import {
  CheckboxField,
  ErrorList,
  Field,
  TextareaField
} from "~/components/form";
import { Button } from "~/components/ui/button";
import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";

export const ShowEditorSchema = z.object({
  archived: z.boolean().default(false),
  description: z.string().optional(),
  id: z.string().optional(),
  sceneCollection: z.nativeEnum(SceneCollection).default("ME"),
  title: z.string({ required_error: "Title is required" })
});

export async function action({ request }: ActionFunctionArgs) {
  await requireUserId(request);
  const formData = await request.formData();
  const submission = parseWithZod(formData, {
    schema: ShowEditorSchema
  });
  if (submission.status !== "success") {
    return json(submission.reply(), {
      status: submission.status === "error" ? 400 : 200
    });
  }

  const { id, ...data } = submission.value;

  if (id) {
    const show = await prisma.show.update({
      data,
      select: { id: true },
      where: { id }
    });
    return redirect(`/console/shows/${show.id}/`);
  }

  const show = await prisma.show.create({
    data,
    select: { id: true }
  });

  return redirect(`/console/shows/${show.id}/`);
}

export function ShowEditor({ show }: { show?: Show }) {
  const showFetcher = useFetcher<typeof action>();

  const [form, fields] = useForm({
    constraint: getZodConstraint(ShowEditorSchema),
    defaultValue: show,
    id: "show-editor",
    lastResult: showFetcher.data,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: ShowEditorSchema });
    },
    shouldValidate: "onBlur"
  });

  return (
    <showFetcher.Form
      action="/resources/show-editor"
      method="post"
      {...getFormProps(form)}
      className="flex flex-col"
    >
      <input {...getInputProps(fields.id, { type: "hidden" })} />
      <Field
        errors={fields.title.errors}
        inputProps={getInputProps(fields.title, { type: "text" })}
        labelProps={{ children: "Title", htmlFor: fields.title.id }}
      />
      <TextareaField
        errors={fields.description.errors}
        labelProps={{ children: "Description", htmlFor: fields.description.id }}
        textareaProps={getTextareaProps(fields.description)}
      />
      <CheckboxField
        buttonProps={getInputProps(fields.archived, { type: "checkbox" })}
        errors={fields.archived.errors}
        labelProps={{ children: "Archived", htmlFor: fields.archived.id }}
      />
      <ErrorList errors={form.errors} id={form.errorId} />
      <div className="mt-2 flex w-full gap-2">
        <Button>Submit</Button>
        <Button asChild variant="secondary">
          <Link to="../">Cancel</Link>
        </Button>
      </div>
    </showFetcher.Form>
  );
}
