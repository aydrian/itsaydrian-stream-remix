import { useForm } from "@conform-to/react";
import { parse } from "@conform-to/zod";
import {
  type DataFunctionArgs,
  Response,
  json,
  redirect
} from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";

const EpisodeDuplicateSchema = z.object({
  episodeId: z.string()
});

export const action = async ({ request }: DataFunctionArgs) => {
  await requireUserId(request);
  const formData = await request.formData();
  const submission = parse(formData, {
    acceptMultipleErrors: () => true,
    schema: EpisodeDuplicateSchema
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

  const { episodeId } = submission.value;
  const findResult = await prisma.episode.findUnique({
    select: {
      description: true,
      endDate: true,
      guests: {
        select: {
          guestId: true,
          order: true
        }
      },
      showId: true,
      startDate: true,
      title: true,
      vdoPassword: true
    },
    where: { id: episodeId }
  });

  if (!findResult) {
    throw new Response("Episode not found", { status: 404 });
  }

  const { guests, ...originalEpisode } = findResult;

  const newEpisode = await prisma.episode.create({
    data: {
      ...originalEpisode,
      guests: {
        createMany: {
          data: guests
        }
      }
    },
    select: { id: true }
  });

  return redirect(
    `/admin/shows/${originalEpisode.showId}/${newEpisode.id}/edit`
  );
};

export function DuplicateEpisodeForm({ episodeId }: { episodeId: string }) {
  const duplicateEpisodeFetcher = useFetcher<typeof action>();

  const [form] = useForm({
    id: "duplicate-episode-form"
  });

  return (
    <duplicateEpisodeFetcher.Form
      action="/resources/episode-duplicate"
      method="post"
      {...form.props}
    >
      <input name="episodeId" type="hidden" value={episodeId} />
      <Button variant="secondary">Duplicate</Button>
    </duplicateEpisodeFetcher.Form>
  );
}
