import { type LoaderArgs } from "@remix-run/node";
import { chromium } from "playwright";

export const loader = async ({ params }: LoaderArgs) => {
  const { episodeId } = params;

  const url = `https://stream.itsaydrian.com/promos/crl/${episodeId}.png`;
  const browser = await chromium.launch();
  const page = await browser.newPage();

  page.setViewportSize({
    width: 1920,
    height: 1080
  });
  await page.goto(url);

  const screenshotBuffer = await page.screenshot();

  await browser.close();

  return new Response(screenshotBuffer, {
    status: 200,
    headers: {
      "Content-Type": "image/png"
    }
  });
};
