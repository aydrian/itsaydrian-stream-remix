import { useNavigate, useSearchParams } from "@remix-run/react";
import { useEffect } from "react";

import { useEpisode } from "~/routes/scenes+/crl+/_layout";

export default function Programming() {
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
