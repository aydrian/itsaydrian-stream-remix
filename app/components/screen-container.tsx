import { useShowGuides } from "~/hooks/use-show-guides";

type props = {
  showGuides?: boolean;
};

export function ScreenContainer({ showGuides }: props) {
  const { elementRef, Dimensions } =
    useShowGuides<HTMLDivElement>("Screen 16:10");
  return (
    <div ref={elementRef} className="aspect-laptop h-full bg-transparent">
      {showGuides ? <Dimensions /> : null}
    </div>
  );
}
