import { type Guest } from "@prisma/client";

import { Avatar } from "~/components/avatar";
import { cn } from "~/utils/misc";

export function TitleGuest({
  className,
  guest
}: {
  className?: string;
  guest: Omit<Guest, "userId">;
}) {
  return (
    <div
      className={cn(
        "flex min-h-fit max-w-min flex-col items-center gap-8",
        className
      )}
      key={guest.id}
    >
      <div className="min-h-fit min-w-fit">
        <Avatar
          alt={`${guest.firstName} ${guest.lastName}`}
          className="aspect-square w-80 bg-gradient-to-r from-crl-electric-purple to-crl-iridescent-blue p-1.5"
          src={guest.avatarUrl}
        />
      </div>
      <div className="flex flex-col items-center text-center">
        <span className="text-3xl font-semibold text-crl-iridescent-blue">{`${guest.firstName} ${guest.lastName}`}</span>
        {guest.title || guest.company ? (
          <span className="text-2xl font-light">{`${guest.title ?? ""}${
            guest.title && guest.company ? ", " : ""
          }${guest.company ?? ""}`}</span>
        ) : null}
      </div>
    </div>
  );
}
