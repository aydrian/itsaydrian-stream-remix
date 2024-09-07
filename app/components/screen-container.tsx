import { z } from "zod";

import { useShowGuides } from "~/hooks/use-show-guides";
import { cn } from "~/utils/misc";

export const ScreenSizeSchema = z.enum(["16:9", "16:10"]);
export type ScreenSize = z.infer<typeof ScreenSizeSchema>;

export function ScreenContainer({
  screenSize = "16:9",
  showGuides
}: {
  screenSize?: ScreenSize;
  showGuides?: boolean;
}) {
  const { elementRef, Guide } = useShowGuides<HTMLDivElement>(
    `Screen ${screenSize}`
  );
  return (
    <div
      className={cn(
        "h-full bg-transparent",
        screenSize === "16:10" && "aspect-laptop",
        screenSize === "16:9" && "aspect-video"
      )}
      ref={elementRef}
    >
      {showGuides ? <Guide /> : null}
    </div>
  );
}
