import { useEffect, useRef, useState } from "react";

export function useShowGuides<T extends HTMLElement>(label?: string) {
  const elementRef = useRef<T>(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (elementRef.current) {
      elementRef.current.className += " relative";
      setWidth(elementRef.current.offsetWidth);
      setHeight(elementRef.current.offsetHeight);
    }
  }, []);

  function Guide() {
    return (
      <div className="absolute z-50 flex h-full w-full items-center justify-center border border-red-500">
        <div className="flex max-h-fit max-w-fit flex-col items-center rounded bg-red-500 p-2 text-white">
          {label ? <div className="text-2xl font-bold">{label}</div> : null}
          <div className="text-xl font-semibold">{`${width} x ${height}`}</div>
        </div>
      </div>
    );
  }

  return { Guide, elementRef, height, width };
}
