import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { Outlet, useRouteLoaderData } from "@remix-run/react";
import { z } from "zod";

import { ScreenSizeSchema } from "~/components/screen-container";
import { getSearchParams } from "~/utils/zod-helpers.server";

const SearchParamsSchema = z.object({
  screenSize: ScreenSizeSchema.default("16:9"),
  showGuides: z.boolean().default(false)
});

export async function loader({ request }: LoaderFunctionArgs) {
  const result = getSearchParams(request, SearchParamsSchema);
  if (!result.success) {
    throw json(result.errors, { status: 400 });
  }
  const screenSize = result.data.screenSize;
  const showGuides = result.data.showGuides;

  return json({ options: { screenSize, showGuides } });
}

export function useOptions() {
  const data = useRouteLoaderData<typeof loader>("routes/scenes+/_layout");
  if (data === undefined) {
    throw new Error(
      "useOptions must be used within the routes/scenes+/ route or its children"
    );
  }
  return data.options;
}

export default function SceneLayout() {
  return <Outlet />;
}
