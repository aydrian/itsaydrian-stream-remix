import atticusAndMe from "~/images/atticus-and-me.png";
import { useEpisode } from "~/routes/scenes+/me+/_layout";

export default function StartingSoon() {
  const { guests, show, title } = useEpisode();
  const areDuelGuests =
    guests.length === 2 && guests[1].firstName !== "Atticus";
  return (
    <div className="flex h-screen w-screen items-center justify-between bg-blue-950 text-white">
      <div className="h-full grow bg-gradient-to-r from-cyan-500 to-green-500 p-8">
        <div className="flex h-full w-full items-center justify-center">
          <div className="flex h-full grow flex-col items-center justify-center rounded-lg bg-blue-950 bg-opacity-75 shadow">
            <div className="flex h-full grow flex-col items-center justify-center gap-1.5">
              {areDuelGuests ? (
                <img
                  alt="Atticus and Me"
                  className="aspect-square h-72 w-72 rounded-full object-cover"
                  src={guests[0].avatarUrl ?? atticusAndMe}
                />
              ) : null}
              <h1 className="max-w-fit bg-gradient-to-r from-cyan-500 to-green-500 bg-clip-text text-center text-8xl font-bold leading-tight text-transparent">
                {show.title}
              </h1>
              <h2 className="text-center text-6xl font-semibold leading-tight">
                {title}
              </h2>
            </div>
            <h2 className="max-w-fit animate-pulse bg-gradient-to-r from-cyan-500 to-green-500 bg-clip-text p-8 text-7xl font-bold leading-tight text-transparent">
              Starting Soon...
            </h2>
          </div>
        </div>
      </div>
      {areDuelGuests ? (
        <figure className="relative h-[1080px] w-[810px]">
          <img
            alt="Guest"
            className="h-full w-full object-cover"
            src={guests[1].avatarUrl ?? atticusAndMe}
          />
          <figcaption className="absolute bottom-0 left-0 w-full bg-blue-950 bg-opacity-90 p-4 text-white">
            <h2 className="text-5xl font-medium">
              {guests[1].firstName} {guests[1].lastName}
            </h2>
            {guests[1].title || guests[1].company ? (
              <h3 className="text-2xl font-light">{`${guests[1].title ?? ""}${
                guests[1].title && guests[1].company ? ", " : ""
              }${guests[1].company ?? ""}`}</h3>
            ) : null}
          </figcaption>
        </figure>
      ) : (
        <img
          alt="Atticus and Me"
          height="1080"
          src={atticusAndMe}
          width="810"
        />
      )}
    </div>
  );
}
