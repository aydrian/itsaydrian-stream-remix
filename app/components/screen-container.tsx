import { useShowGuides } from "~/hooks/use-show-guides";
import { cn } from "~/utils/misc";

export type ScreenSize = "16:9" | "16:10";

export function ScreenContainer({
  screenSize = "16:9",
  showGuides
}: {
  screenSize?: ScreenSize;
  showGuides?: boolean;
}) {
  const { Guide, elementRef } = useShowGuides<HTMLDivElement>(
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
