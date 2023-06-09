import { useShowGuides } from "~/hooks/use-show-guides";
import { cn } from "~/utils/misc";

export type ScreenSize = "16:9" | "16:10";

type props = {
  showGuides?: boolean;
  screenSize?: ScreenSize;
};

export function ScreenContainer({ showGuides, screenSize = "16:10" }: props) {
  const { elementRef, Guide } = useShowGuides<HTMLDivElement>(
    `Screen ${screenSize}`
  );
  return (
    <div
      ref={elementRef}
      className={cn(
        "h-full bg-transparent",
        screenSize === "16:10" && "aspect-laptop",
        screenSize === "16:9" && "aspect-video"
      )}
    >
      {showGuides ? <Guide /> : null}
    </div>
  );
}
