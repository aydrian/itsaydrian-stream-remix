import { type SVGProps } from "react";

import { type IconName } from "~/components/icons/names";
import spriteHref from "~/components/icons/sprite.svg";

export type IconProps = {
  name: IconName;
} & SVGProps<SVGSVGElement>;

export function Icon({ name, ...props }: IconProps) {
  return (
    <svg {...props}>
      <use href={`${spriteHref}#${name}`} />
    </svg>
  );
}
