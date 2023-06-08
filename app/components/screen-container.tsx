import { useShowGuides } from "~/hooks/use-show-guides";

type props = {
  showGuides?: boolean;
};

export function ScreenContainer({ showGuides }: props) {
  const { elementRef, Guide } = useShowGuides<HTMLDivElement>("Screen 16:10");
  return (
    <div ref={elementRef} className="aspect-laptop h-full bg-transparent">
      {showGuides ? <Guide /> : null}
    </div>
  );
}
