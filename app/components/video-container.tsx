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
      className={`flex flex-col items-center justify-center m-0 relative z-10 ${
        size === "sidebar" ? "w-[438px]" : ""
      }`}
    >
      <div className={`object-cover ${getVideoSize(size)}`}>
        <div className="w-full h-full" />
      </div>

      <figcaption className="absolute bottom-4 left-4">
        <div className="text-center rounded px-4 pt-2 pb-[.625rem] bg-slate-800 opacity-10">
          <span className="text-white block text-3xl font-normal relative z-10">
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
