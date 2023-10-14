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
import { Link, useFetcher } from "@remix-run/react";
import { toDate } from "date-fns-tz";
import React, { useRef } from "react";
import { z } from "zod";

import { ErrorList, Field, TextareaField } from "~/components/form";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "~/components/ui/select";
import { useEpisodesLayoutLoaderData } from "~/routes/admin+/shows+/$showId+/episodes+/_layout";
import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { formatDateForInput } from "~/utils/misc";

export const EpisodeGuestSchema = z.object({
  guest: z
    .object({
      avatarUrl: z.string().nullable(),
      firstName: z.string(),
      lastName: z.string()
    })
    .optional(),
  guestId: z.string(),
  order: z.number()
});

export const EpisodeEditorSchema = z.object({
  description: z.string({ required_error: "Description is required" }),
  endDate: z.string({ required_error: "End Date is required" }),
  guests: z.array(EpisodeGuestSchema.omit({ guest: true })).min(1),
  id: z.string().optional(),
  showId: z.string(),
  startDate: z.string({ required_error: "Start Date is required" }),
  subtitle: z.string().optional(),
  timeZone: z.string(),
  title: z.string({ required_error: "Title is required" }),
  vdoPassword: z.string().default("cockroachIsC00l!")
});

export const action = async ({ request }: DataFunctionArgs) => {
  await requireUserId(request);
  const formData = await request.formData();
  const submission = parse(formData, {
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
  console.log({ guests });

  if (id) {
    const episodeUpdate = prisma.episode.update({
      data: {
        ...data,
        endDate: toDate(endDate, { timeZone }),
        startDate: toDate(startDate, { timeZone })
      },
      where: { id }
    });

    const guestsDelete = prisma.guestsForEpisode.deleteMany({
      where: { episodeId: id, guestId: { notIn: guests.map((g) => g.guestId) } }
    });

    const guestUpserts = guests.map((guest) => {
      return prisma.guestsForEpisode.upsert({
        create: {
          episodeId: id,
          guestId: guest.guestId,
          order: guest.order
        },
        update: { order: guest.order },
        where: {
          episodeId_guestId: { episodeId: id, guestId: guest.guestId }
        }
      });
    });

    await prisma.$transaction([episodeUpdate, guestsDelete, ...guestUpserts]);

    return redirect(`/admin/shows/${data.showId}/episodes/${id}`);
  }

  const episode = await prisma.episode.create({
    data: {
      ...data,
      endDate: toDate(endDate, { timeZone }),
      guests: { create: guests },
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
      guest: {
        avatarUrl: null | string;
        firstName: string;
        lastName: string;
      };
      guestId: string;
      order: number;
    }[];
    id: string;
    showId: string;
    startDate: Date;
    subtitle: null | string;
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
      subtitle,
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
      subtitle: episode?.subtitle,
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
      <input name={id.name} type="hidden" value={id.defaultValue} />
      <input name={show_id.name} type="hidden" value={show_id.defaultValue} />
      <Field
        errors={title.errors}
        inputProps={conform.input(title)}
        labelProps={{ children: "Title", htmlFor: title.id }}
      />
      <Field
        errors={subtitle.errors}
        inputProps={conform.input(subtitle)}
        labelProps={{ children: "Subtitle", htmlFor: subtitle.id }}
      />
      <TextareaField
        errors={description.errors}
        labelProps={{ children: "Description", htmlFor: description.id }}
        textareaProps={conform.textarea(description)}
      />
      <div className="flex w-full flex-row justify-between gap-1">
        <input
          name="timeZone"
          type="hidden"
          value={Intl.DateTimeFormat().resolvedOptions().timeZone}
        />
        <Field
          className="grow"
          errors={startDate.errors}
          inputProps={conform.input(startDate, {
            type: "datetime-local"
          })}
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
        errors={vdoPassword.errors}
        inputProps={conform.input(vdoPassword)}
        labelProps={{
          children: "VDO Password",
          htmlFor: vdoPassword.id
        }}
      />
      <h4 className="mb-1.5 text-lg font-semibold leading-tight text-gray-700">
        Select your guests
      </h4>
      <GuestSelector formRef={form.ref} guests={guests} />

      <ErrorList errors={form.errors} id={form.errorId} />
      <div className="mt-2 flex w-full gap-2">
        <Button>Submit</Button>
        <Button asChild variant="secondary">
          <Link to="../">Cancel</Link>
        </Button>
      </div>
    </episodeEditorFetcher.Form>
  );
}

function GuestSelector({
  formRef,
  guests
}: {
  formRef: React.RefObject<HTMLFormElement>;
  guests: FieldConfig<z.input<typeof EpisodeGuestSchema>[]>;
}) {
  const guestList = useFieldList(formRef, guests);
  const { allGuests } = useEpisodesLayoutLoaderData();
  const [selectedGuest, setSelectedGuest] = React.useState<
    Omit<z.input<typeof EpisodeGuestSchema>, "order"> | undefined
  >(undefined);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        <Select
          onValueChange={(value) => {
            const guest = allGuests.find(({ id }) => id === value);
            if (guest) {
              setSelectedGuest({
                guest: {
                  avatarUrl: guest.avatarUrl,
                  firstName: guest.firstName,
                  lastName: guest.lastName
                },
                guestId: guest.id
              });
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a guest" />
          </SelectTrigger>
          <SelectContent>
            {allGuests.map((guest) => (
              <SelectItem
                key={guest.id}
                value={guest.id}
              >{`${guest.firstName} ${guest.lastName}`}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          className="bottom-2 right-2 text-xs"
          size="sm"
          variant="secondary"
          {...list.insert(guests.name, { defaultValue: selectedGuest })}
        >
          Add
        </Button>
      </div>
      <div className="flex flex-wrap gap-4">
        {guestList.map(({ key, ...guest }, index) => {
          return (
            <GuestFieldset
              config={guest}
              index={index}
              isRemovable={guestList.length > 1}
              key={key}
              listName={guests.name}
            />
          );
        })}
      </div>
    </div>
  );
}

function GuestFieldset({
  config,
  index,
  isRemovable = false,
  listName
}: {
  config: FieldConfig<z.input<typeof EpisodeGuestSchema>>;
  index: number;
  isRemovable?: boolean;
  listName: string;
}) {
  const ref = useRef<HTMLFieldSetElement>(null);
  const { guest, guestId, order } = useFieldset(ref, config);

  return (
    <fieldset ref={ref}>
      <input {...conform.input(guestId, { type: "hidden" })} />
      <input
        {...conform.input(order, { type: "hidden" })}
        defaultValue={order.defaultValue ?? index}
      />
      <Card className="w-48">
        <CardHeader>
          <CardTitle>{index === 0 ? "Host" : `Guest ${index}`}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Avatar className="mx-auto h-32 w-32 shadow-md">
            <AvatarImage
              alt={`${guest.defaultValue?.firstName} ${guest.defaultValue?.lastName}`}
              src={guest.defaultValue?.avatarUrl ?? undefined}
            />
            <AvatarFallback>{`${guest.defaultValue?.firstName.charAt(
              0
            )}${guest.defaultValue?.lastName.charAt(0)}`}</AvatarFallback>
          </Avatar>
          <CardTitle>{`${guest.defaultValue?.firstName} ${guest.defaultValue?.lastName}`}</CardTitle>
        </CardContent>
        <CardFooter>
          {isRemovable ? (
            <Button
              className="bottom-2 right-2 text-xs"
              size="sm"
              variant="destructive"
              {...list.remove(listName, { index })}
            >
              Remove
            </Button>
          ) : null}
        </CardFooter>
      </Card>
    </fieldset>
  );
}
