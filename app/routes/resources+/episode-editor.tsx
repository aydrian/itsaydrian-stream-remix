import {
  type FieldName,
  FormProvider,
  getFieldsetProps,
  getFormProps,
  getInputProps,
  getTextareaProps,
  useField,
  useForm
} from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { type ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { Link, useFetcher } from "@remix-run/react";
import { toDate } from "date-fns-tz";
import React from "react";
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
import { useEpisodesLayoutLoaderData } from "~/routes/console+/shows+/$showId+/episodes+/_layout";
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

export type EpisodeGuest = z.infer<typeof EpisodeGuestSchema>;

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
  vdoPassword: z.string().default("its@drianB1rch")
});

export const action = async ({ request }: ActionFunctionArgs) => {
  await requireUserId(request);
  const formData = await request.formData();
  const submission = parseWithZod(formData, {
    schema: EpisodeEditorSchema
  });

  if (submission.status !== "success") {
    return json(submission.reply(), {
      status: submission.status === "error" ? 400 : 200
    });
  }

  const { endDate, guests, id, startDate, timeZone, ...data } =
    submission.value;

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

    return redirect(`/console/shows/${data.showId}/episodes/${id}`);
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

  return redirect(`/console/shows/${data.showId}/episodes/${episode.id}`);
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

  const [form, fields] = useForm({
    constraint: getZodConstraint(EpisodeEditorSchema),
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
    lastResult: episodeEditorFetcher.data,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: EpisodeEditorSchema });
    },
    shouldRevalidate: "onBlur"
  });

  return (
    <episodeEditorFetcher.Form
      action="/resources/episode-editor"
      method="post"
      {...getFormProps(form)}
      className="flex flex-col"
    >
      <input {...getInputProps(fields.id, { type: "hidden" })} />
      <input {...getInputProps(fields.showId, { type: "hidden" })} />
      <Field
        errors={fields.title.errors}
        inputProps={getInputProps(fields.title, { type: "text" })}
        labelProps={{ children: "Title", htmlFor: fields.title.id }}
      />
      <Field
        errors={fields.subtitle.errors}
        inputProps={getInputProps(fields.subtitle, { type: "text" })}
        labelProps={{ children: "Subtitle", htmlFor: fields.subtitle.id }}
      />
      <TextareaField
        errors={fields.description.errors}
        labelProps={{ children: "Description", htmlFor: fields.description.id }}
        textareaProps={getTextareaProps(fields.description)}
      />
      <div className="flex w-full flex-row justify-between gap-1">
        <input
          name="timeZone"
          type="hidden"
          value={Intl.DateTimeFormat().resolvedOptions().timeZone}
        />
        <Field
          className="grow"
          errors={fields.startDate.errors}
          inputProps={getInputProps(fields.startDate, {
            type: "datetime-local"
          })}
          labelProps={{ children: "Start Date", htmlFor: fields.startDate.id }}
        />
        <Field
          className="grow"
          errors={fields.endDate.errors}
          inputProps={getInputProps(fields.endDate, { type: "datetime-local" })}
          labelProps={{ children: "End Date", htmlFor: fields.endDate.id }}
        />
      </div>
      <Field
        errors={fields.vdoPassword.errors}
        inputProps={getInputProps(fields.vdoPassword, { type: "text" })}
        labelProps={{
          children: "VDO Password",
          htmlFor: fields.vdoPassword.id
        }}
      />
      <h4 className="mb-1.5 text-lg font-semibold leading-tight text-gray-700">
        Select your guests
      </h4>
      <FormProvider context={form.context}>
        <GuestSelector guests={fields.guests.name} />
      </FormProvider>

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

function GuestSelector({ guests }: { guests: FieldName<EpisodeGuest[]> }) {
  const { allGuests } = useEpisodesLayoutLoaderData();
  const [selectedGuest, setSelectedGuest] = React.useState<
    Omit<z.input<typeof EpisodeGuestSchema>, "order"> | undefined
  >(undefined);
  const [meta, form] = useField(guests);
  const guestList = meta.getFieldList();
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
          {...form.insert.getButtonProps({
            defaultValue: selectedGuest,
            name: meta.name
          })}
        >
          Add
        </Button>
      </div>
      <div className="flex flex-wrap gap-4">
        {guestList.map((guest, index) => {
          return (
            <GuestFieldset
              index={index}
              isRemovable={guests.length > 1}
              key={guest.key}
              listName={meta.name}
              name={guest.name}
            />
          );
        })}
      </div>
    </div>
  );
}

function GuestFieldset({
  index,
  isRemovable = false,
  listName,
  name
}: {
  index: number;
  isRemovable?: boolean;
  listName: string;
  name: FieldName<EpisodeGuest>;
}) {
  const [meta, form] = useField(name);
  const fields = meta.getFieldset();
  const guest = fields.guest.getFieldset();

  return (
    <fieldset {...getFieldsetProps(meta)}>
      <input {...getInputProps(fields.guestId, { type: "hidden" })} />
      <input
        {...getInputProps(fields.order, { type: "hidden" })}
        defaultValue={fields.order.value ?? index}
      />
      <Card className="w-48">
        <CardHeader>
          <CardTitle>{index === 0 ? "Host" : `Guest ${index}`}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Avatar className="mx-auto h-32 w-32 shadow-md">
            <AvatarImage
              alt={`${guest.firstName.value} ${guest.lastName.value}`}
              src={guest.avatarUrl.value}
            />
            <AvatarFallback>{`${guest.firstName.value?.charAt(
              0
            )}${guest.lastName.value?.charAt(0)}`}</AvatarFallback>
          </Avatar>
          <CardTitle>{`${guest.firstName.value} ${guest.lastName.value}`}</CardTitle>
        </CardContent>
        <CardFooter>
          {isRemovable ? (
            <Button
              className="bottom-2 right-2 text-xs"
              size="sm"
              variant="destructive"
              {...form.remove.getButtonProps({ index, name: listName })}
            >
              Remove
            </Button>
          ) : null}
        </CardFooter>
      </Card>
    </fieldset>
  );
}
