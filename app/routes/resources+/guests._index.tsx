import { AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { useEffect } from "react";

import { Avatar } from "~/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "~/components/ui/select";
import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireUserId(request);

  const guests = await prisma.guest.findMany({
    select: { avatarUrl: true, firstName: true, id: true, lastName: true }
  });

  return json({ guests });
};

export function GuestSelect({
  defaultValue,
  name
}: {
  defaultValue?: string;
  name: string;
}) {
  const guestFetcher = useFetcher<typeof loader>();
  const guests = guestFetcher.data?.guests ?? [];

  useEffect(() => {
    if (guestFetcher.state === "idle" && guestFetcher.data == null) {
      guestFetcher.load("/resources/guests");
    }
  }, [guestFetcher]);

  return (
    <Select defaultValue={defaultValue} name={name}>
      <SelectTrigger>
        <SelectValue placeholder="Guest" />
      </SelectTrigger>
      <SelectContent>
        {guests.map((guest) => (
          <SelectItem key={guest.id} value={guest.id}>
            <div className="flex items-center gap-1.5">
              <Avatar className="h-6 w-auto">
                <AvatarImage src={guest.avatarUrl ?? undefined} />
                <AvatarFallback className="leading-1 bg-cyan-100 text-[15px] font-medium text-cyan-700">{`${guest.firstName.charAt(
                  0
                )}${guest.lastName.charAt(0)}`}</AvatarFallback>
              </Avatar>{" "}
              <span>{`${guest.firstName} ${guest.lastName}`}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
