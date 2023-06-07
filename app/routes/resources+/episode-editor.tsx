import { type DataFunctionArgs, redirect, json } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { requireUser } from "~/utils/auth.server";
import { z } from "zod";
import { conform, useForm } from "@conform-to/react";
import { getFieldsetConstraint, parse } from "@conform-to/zod";
import { prisma } from "~/utils/db.server";
import { ErrorList, Field } from "~/components/form";
import { formatDateForInput } from "~/utils/misc";

export const EpisodeEditorSchema = z.object({
  id: z.string().optional(),
  showId: z.string(),
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  startDate: z.coerce.date({ required_error: "Start Date is required" }),
  endDate: z.coerce.date({ required_error: "End Date is required" }),
  vdoPassword: z.string().default("cockroachIsC00l!")
  // guests: z.array(z.object({ order: z.coerce.number(), guestId: z.string() }))
});

export const action = async ({ request }: DataFunctionArgs) => {
  await requireUser(request);
  const formData = await request.formData();
  const submission = parse(formData, {
    schema: EpisodeEditorSchema,
    acceptMultipleErrors: () => true
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
    await prisma.episode.update({
      where: { id },
      data
    });
    return redirect(`/admin/shows/${data.showId}/episodes/${id}`);
  }

  const episode = await prisma.episode.create({
    data,
    select: { id: true }
  });

  return redirect(`/admin/show/${data.showId}/episodes/${episode.id}`);
};

export function EpisodeEditor({
  episode,
  showId
}: {
  episode?: {
    id: string;
    showId: string;
    startDate: Date;
    endDate: Date;
    title: string;
    description: string;
    vdoPassword: string;
    // guests: {
    //   order: number;
    //   guestId: string;
    // }[];
  };
  showId: string;
}) {
  const episodeEditorFetcher = useFetcher<typeof action>();

  const [form, fields] = useForm({
    id: "episode-editor",
    constraint: getFieldsetConstraint(EpisodeEditorSchema),
    lastSubmission: episodeEditorFetcher.data?.submission,
    onValidate({ formData }) {
      return parse(formData, { schema: EpisodeEditorSchema });
    },
    defaultValue: {
      title: episode?.title,
      description: episode?.description,
      startDate: formatDateForInput(episode?.startDate),
      endDate: formatDateForInput(episode?.endDate),
      vdoPassword: episode?.vdoPassword
    },
    shouldRevalidate: "onBlur"
  });

  return (
    <episodeEditorFetcher.Form
      method="post"
      action="/resources/episode-editor"
      {...form.props}
      className="flex flex-col"
    >
      <input name="id" type="hidden" value={episode?.id} />
      <input name="showId" type="hidden" value={episode?.showId || showId} />
      <Field
        labelProps={{ htmlFor: fields.title.id, children: "Title" }}
        inputProps={conform.input(fields.title)}
        errors={fields.title.errors}
      />
      <Field
        labelProps={{ htmlFor: fields.description.id, children: "Description" }}
        inputProps={conform.input(fields.description)}
        errors={fields.description.errors}
      />
      <div className="flex w-full flex-row justify-between gap-1">
        <Field
          className="grow"
          labelProps={{ htmlFor: fields.startDate.id, children: "Start Date" }}
          inputProps={conform.input(fields.startDate, {
            type: "datetime-local"
          })}
          errors={fields.startDate.errors}
        />
        <Field
          className="grow"
          labelProps={{ htmlFor: fields.endDate.id, children: "End Date" }}
          inputProps={conform.input(fields.endDate, { type: "datetime-local" })}
          errors={fields.endDate.errors}
        />
      </div>
      <Field
        labelProps={{
          htmlFor: fields.vdoPassword.id,
          children: "VDO Password"
        }}
        inputProps={conform.input(fields.vdoPassword)}
        errors={fields.vdoPassword.errors}
      />
      <ErrorList errors={form.errors} id={form.errorId} />
      <Button>Submit</Button>
    </episodeEditorFetcher.Form>
  );
}
