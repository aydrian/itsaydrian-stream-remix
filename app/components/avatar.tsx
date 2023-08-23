import clsx from "clsx";

import { Icon } from "./icon";

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
        <Icon
          className="aspect-square h-full text-white"
          name="crl-shorthand"
        />
      )}
    </div>
  );
}
