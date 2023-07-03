import {
  type FieldConfig,
  conform,
  list,
  useFieldList,
  useFieldset,
  useForm
} from "@conform-to/react";
import { getFieldsetConstraint, parse } from "@conform-to/zod";
import { type DataFunctionArgs, json, redirect } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { toDate } from "date-fns-tz";
import { useRef } from "react";
import { z } from "zod";

import { ErrorList, Field } from "~/components/form";
import { Button } from "~/components/ui/button";
import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { formatDateForInput } from "~/utils/misc";

import { GuestSelect } from "./guests";

export const EpisodeGuestSchema = z.object({
  guestId: z.string().optional(),
  order: z.coerce.number()
});

export const EpisodeEditorSchema = z.object({
  description: z.string().min(1, { message: "Description is required" }),
  endDate: z.string().min(1, { message: "End Date is required" }),
  guests: z.array(EpisodeGuestSchema).min(1),
  id: z.string().optional(),
  showId: z.string(),
  startDate: z.string().min(1, { message: "Start Date is required" }),
  timeZone: z.string(),
  title: z.string().min(1, { message: "Title is required" }),
  vdoPassword: z.string().default("cockroachIsC00l!")
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

  const { endDate, guests, id, startDate, timeZone, ...data } =
    submission.value;

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
    guests: {
      guestId: string;
      order: number;
    }[];
    id: string;
    showId: string;
    startDate: Date;
    title: string;
    vdoPassword: string;
  };
  showId?: string;
}) {
  const episodeEditorFetcher = useFetcher<typeof action>();

  const [
    form,
    {
      description,
      endDate,
      guests,
      id,
      showId: show_id,
      startDate,
      title,
      vdoPassword
    }
  ] = useForm({
    constraint: getFieldsetConstraint(EpisodeEditorSchema),
    defaultValue: {
      description: episode?.description,
      endDate: formatDateForInput(episode?.endDate),
      guests: episode?.guests,
      id: episode?.id,
      showId: episode?.showId ?? showId,
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
  const guestList = useFieldList(form.ref, guests);

  return (
    <episodeEditorFetcher.Form
      action="/resources/episode-editor"
      method="post"
      {...form.props}
      className="flex flex-col"
    >
      <input name={id.name} type="hidden" value={id.defaultValue} />
      <input name={show_id.name} type="hidden" value={show_id.defaultValue} />
      <Field
        errors={title.errors}
        inputProps={conform.input(title)}
        labelProps={{ children: "Title", htmlFor: title.id }}
      />
      <Field
        errors={description.errors}
        inputProps={conform.input(description)}
        labelProps={{ children: "Description", htmlFor: description.id }}
      />
      <div className="flex w-full flex-row justify-between gap-1">
        <input
          name="timeZone"
          type="hidden"
          value={Intl.DateTimeFormat().resolvedOptions().timeZone}
        />
        <Field
          inputProps={conform.input(startDate, {
            type: "datetime-local"
          })}
          className="grow"
          errors={startDate.errors}
          labelProps={{ children: "Start Date", htmlFor: startDate.id }}
        />
        <Field
          className="grow"
          errors={endDate.errors}
          inputProps={conform.input(endDate, { type: "datetime-local" })}
          labelProps={{ children: "End Date", htmlFor: endDate.id }}
        />
      </div>
      <Field
        labelProps={{
          children: "VDO Password",
          htmlFor: vdoPassword.id
        }}
        errors={vdoPassword.errors}
        inputProps={conform.input(vdoPassword)}
      />
      <h3 className="mb-1.5 text-xl font-semibold leading-tight text-gray-700">
        Select your guests
      </h3>
      <ul>
        {guestList.map((guest, index) => (
          <li className="relative" key={guest.key}>
            <GuestFieldset {...guest} index={index} />
            {guestList.length > 1 ? (
              <Button
                className="absolute bottom-2 right-2 text-xs"
                size="sm"
                variant="destructive"
                {...list.remove(guests.name, { index })}
              >
                Remove
              </Button>
            ) : null}
          </li>
        ))}
      </ul>
      <Button
        className="mb-3"
        size="sm"
        variant="secondary"
        {...list.append(guests.name)}
      >
        Add a Guest
      </Button>
      <ErrorList errors={form.errors} id={form.errorId} />
      <Button>Submit</Button>
    </episodeEditorFetcher.Form>
  );
}

function GuestFieldset(
  config: FieldConfig<z.input<typeof EpisodeGuestSchema>> & { index: number }
) {
  const ref = useRef<HTMLFieldSetElement>(null);
  const { guestId, order } = useFieldset(ref, config);

  return (
    <fieldset ref={ref}>
      <input name={order.name} type="hidden" value={String(config.index)} />
      <Field
        errors={guestId.errors}
        inputProps={conform.input(guestId)}
        labelProps={{ children: "Guest Id", htmlFor: guestId.id }}
      />
      <GuestSelect defaultValue={guestId.defaultValue} name={guestId.name} />
    </fieldset>
  );
}
