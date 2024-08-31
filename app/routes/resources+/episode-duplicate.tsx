import { getFormProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { type ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";

const EpisodeDuplicateSchema = z.object({
  episodeId: z.string()
});

export const action = async ({ request }: ActionFunctionArgs) => {
  await requireUserId(request);
  const formData = await request.formData();
  const submission = parseWithZod(formData, {
    schema: EpisodeDuplicateSchema
  });

  if (submission.status !== "success") {
    return json(submission.reply(), { status: 400 });
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
    `/console/shows/${originalEpisode.showId}/episodes/${newEpisode.id}/edit`
  );
};

export function DuplicateEpisodeForm({ episodeId }: { episodeId: string }) {
  const duplicateEpisodeFetcher = useFetcher<typeof action>();

  const [form] = useForm({
    id: "duplicate-episode-form",
    onSubmit(event) {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      duplicateEpisodeFetcher.submit(formData, {
        action: "/resources/episode-duplicate",
        method: "post"
      });
    }
  });

  return (
    <form {...getFormProps(form)}>
      <input name="episodeId" type="hidden" value={episodeId} />
      <Button size="sm" type="submit" variant="secondary">
        Duplicate
      </Button>
    </form>
  );
}
