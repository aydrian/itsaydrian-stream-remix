import { useEffect } from "react";
import { useNavigate, useSearchParams } from "@remix-run/react";
import { useEpisode } from "./_layout";

export default function Chatting() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { guests } = useEpisode();
  useEffect(() => {
    navigate(
      `./${guests.length}${searchParams.size > 0 ? `?${searchParams}` : ""}`,
      { replace: true }
    );
  }, [guests.length, navigate, searchParams]);
}
