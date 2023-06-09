import { type LoaderArgs } from "@remix-run/node";
import { chromium } from "playwright";

import env from "~/utils/env.server";

export const loader = async ({ params }: LoaderArgs) => {
  const { episodeId } = params;

  const url = `${
    env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : `https://${env.FLY_APP_NAME}.fly.dev`
  }/promos/crl/${episodeId}`;
  const browser = await chromium.launch();
  const page = await browser.newPage();

  page.setViewportSize({
    height: 1080,
    width: 1920
  });
  await page.goto(url);

  const screenshotBuffer = await page.screenshot();

  await browser.close();

  return new Response(screenshotBuffer, {
    headers: {
      "Content-Type": "image/png"
    },
    status: 200
  });
};
