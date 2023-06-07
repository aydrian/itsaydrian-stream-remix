import {
  type DataFunctionArgs,
  redirect,
  json,
  Response
} from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { requireUserId } from "~/utils/auth.server";
import { z } from "zod";
import { useForm } from "@conform-to/react";
import { parse } from "@conform-to/zod";
import { prisma } from "~/utils/db.server";

const EpisodeDuplicateSchema = z.object({
  episodeId: z.string()
});

export const action = async ({ request }: DataFunctionArgs) => {
  await requireUserId(request);
  const formData = await request.formData();
  const submission = parse(formData, {
    schema: EpisodeDuplicateSchema,
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

  const { episodeId } = submission.value;
  const findResult = await prisma.episode.findUnique({
    where: { id: episodeId },
    select: {
      showId: true,
      title: true,
      startDate: true,
      endDate: true,
      description: true,
      vdoPassword: true,
      guests: {
        select: {
          guestId: true,
          order: true
        }
      }
    }
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
      method="post"
      action="/resources/episode-duplicate"
      {...form.props}
    >
      <input name="episodeId" type="hidden" value={episodeId} />
      <Button variant="secondary">Duplicate</Button>
    </duplicateEpisodeFetcher.Form>
  );
}
