import clsx from "clsx";

import { Shorthand } from "./cockroach-labs-logos";

export function Avatar({
  alt,
  className,
  src
}: {
  alt: string;
  className?: string;
  src: null | string;
}) {
  return (
    <div className={clsx("overflow-hidden rounded-full", className)}>
      {src ? (
        <img
          alt={alt}
          className="aspect-square h-full rounded-full"
          src={src}
        />
      ) : (
        <Shorthand className="aspect-square h-full text-white" />
      )}
    </div>
  );
}
