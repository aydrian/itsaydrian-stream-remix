import { conform, useForm } from "@conform-to/react";
import { getFieldsetConstraint, parse } from "@conform-to/zod";
import { type DataFunctionArgs, json, redirect } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { toDate } from "date-fns-tz";
import { z } from "zod";

import { ErrorList, Field } from "~/components/form";
import { Button } from "~/components/ui/button";
import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { formatDateForInput } from "~/utils/misc";

export const EpisodeEditorSchema = z.object({
  description: z.string().min(1, { message: "Description is required" }),
  endDate: z.string().min(1, { message: "End Date is required" }),
  id: z.string().optional(),
  showId: z.string(),
  startDate: z.string().min(1, { message: "Start Date is required" }),
  timeZone: z.string(),
  title: z.string().min(1, { message: "Title is required" }),
  vdoPassword: z.string().default("cockroachIsC00l!")
  // guests: z.array(z.object({ order: z.coerce.number(), guestId: z.string() }))
});

export const action = async ({ request }: DataFunctionArgs) => {
  await requireUserId(request);
  const formData = await request.formData();
  const submission = parse(formData, {
    acceptMultipleErrors: () => true,
    schema: EpisodeEditorSchema
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

  const { endDate, id, startDate, timeZone, ...data } = submission.value;

  if (id) {
    await prisma.episode.update({
      data: {
        ...data,
        endDate: toDate(endDate, { timeZone }),
        startDate: toDate(startDate, { timeZone })
      },
      where: { id }
    });
    return redirect(`/admin/shows/${data.showId}/episodes/${id}`);
  }

  const episode = await prisma.episode.create({
    data: {
      ...data,
      endDate: toDate(endDate, { timeZone }),
      startDate: toDate(startDate, { timeZone })
    },
    select: { id: true }
  });

  return redirect(`/admin/shows/${data.showId}/episodes/${episode.id}`);
};

export function EpisodeEditor({
  episode,
  showId
}: {
  episode?: {
    description: string;
    endDate: Date;
    id: string;
    showId: string;
    startDate: Date;
    title: string;
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
    constraint: getFieldsetConstraint(EpisodeEditorSchema),
    defaultValue: {
      description: episode?.description,
      endDate: formatDateForInput(episode?.endDate),
      startDate: formatDateForInput(episode?.startDate),
      title: episode?.title,
      vdoPassword: episode?.vdoPassword
    },
    id: "episode-editor",
    lastSubmission: episodeEditorFetcher.data?.submission,
    onValidate({ formData }) {
      return parse(formData, { schema: EpisodeEditorSchema });
    },
    shouldRevalidate: "onBlur"
  });

  return (
    <episodeEditorFetcher.Form
      action="/resources/episode-editor"
      method="post"
      {...form.props}
      className="flex flex-col"
    >
      <input name="id" type="hidden" value={episode?.id} />
      <input name="showId" type="hidden" value={episode?.showId || showId} />
      <Field
        errors={fields.title.errors}
        inputProps={conform.input(fields.title)}
        labelProps={{ children: "Title", htmlFor: fields.title.id }}
      />
      <Field
        errors={fields.description.errors}
        inputProps={conform.input(fields.description)}
        labelProps={{ children: "Description", htmlFor: fields.description.id }}
      />
      <div className="flex w-full flex-row justify-between gap-1">
        <input
          name="timeZone"
          type="hidden"
          value={Intl.DateTimeFormat().resolvedOptions().timeZone}
        />
        <Field
          inputProps={conform.input(fields.startDate, {
            type: "datetime-local"
          })}
          className="grow"
          errors={fields.startDate.errors}
          labelProps={{ children: "Start Date", htmlFor: fields.startDate.id }}
        />
        <Field
          className="grow"
          errors={fields.endDate.errors}
          inputProps={conform.input(fields.endDate, { type: "datetime-local" })}
          labelProps={{ children: "End Date", htmlFor: fields.endDate.id }}
        />
      </div>
      <Field
        labelProps={{
          children: "VDO Password",
          htmlFor: fields.vdoPassword.id
        }}
        errors={fields.vdoPassword.errors}
        inputProps={conform.input(fields.vdoPassword)}
      />
      <ErrorList errors={form.errors} id={form.errorId} />
      <Button>Submit</Button>
    </episodeEditorFetcher.Form>
  );
}
