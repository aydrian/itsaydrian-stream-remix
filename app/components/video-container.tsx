type videoSize = "interview" | "monologue" | "sidebar" | "sidebar-solo";

type props = {
  name: string;
  twitter: string;
  size: videoSize;
};

export function VideoContainer({
  name = "Aydrian Howard",
  twitter = "itsaydrian",
  size = "interview"
}: props) {
  return (
    <figure
      className={`relative z-10 m-0 flex flex-col items-center justify-center ${
        size === "sidebar" ? "w-[438px]" : ""
      }`}
    >
      <div className={`object-cover ${getVideoSize(size)}`}>
        <div className="h-full w-full" />
      </div>

      <figcaption className="absolute bottom-4 left-4">
        <div className="rounded bg-slate-800 px-4 pb-[.625rem] pt-2 text-center opacity-10">
          <span className="relative z-10 block text-3xl font-normal text-white">
            {name}
          </span>
        </div>
      </figcaption>
    </figure>
  );
}

function getVideoSize(size: videoSize) {
  switch (size) {
    case "monologue":
      return "aspect-[16/7.3] w-[1920px]";
    case "interview":
      return "aspect-[8/7.3] w-[960px]";
    case "sidebar":
      return "aspect-[6/4.14] w-full";
    case "sidebar-solo":
      return "aspect-[6/8.31] w-full";
    default:
      return "";
  }
}
