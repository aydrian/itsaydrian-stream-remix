import { useEffect, useRef, useState } from "react";

export function useShowGuides<T extends HTMLElement>() {
  const elementRef = useRef<T>(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (elementRef.current) {
      setWidth(elementRef.current.offsetWidth);
      setHeight(elementRef.current.offsetHeight);
    }
  }, []);

  function Dimensions() {
    return (
      <div className="flex h-full w-full items-center justify-center border border-red-500">
        <div className="max-h-fit max-w-fit rounded bg-red-500 p-2 text-2xl font-semibold text-white">{`${width} x ${height}`}</div>
      </div>
    );
  }

  return { elementRef, width, height, Dimensions };
}
