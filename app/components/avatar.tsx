import clsx from "clsx";
import { Shorthand } from "./cockroach-labs-logos";

export function Avatar({
  src,
  alt,
  className
}: {
  src: string | null;
  alt: string;
  className?: string;
}) {
  return (
    <div className={clsx("overflow-hidden rounded-full", className)}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className="aspect-square h-full rounded-full"
        />
      ) : (
        <Shorthand className="aspect-square h-full text-white" />
      )}
    </div>
  );
}
