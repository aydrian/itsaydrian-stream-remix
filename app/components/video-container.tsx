export type videoSize = "interview" | "monologue" | "sidebar" | "sidebar-solo";

type props = {
  name?: string;
  twitter?: string;
  title?: string;
  size?: videoSize;
};

export function VideoContainer({
  name = "Aydrian Howard",
  twitter,
  title,
  size = "interview"
}: props) {
  return (
    <figure
      className={`relative z-10 m-0 flex flex-col items-center justify-center`}
    >
      <div className={` object-cover ${getVideoSize(size)}`}>
        <div className="h-full w-full" />
      </div>

      <figcaption className="absolute bottom-4 left-4">
        <div className="rounded bg-black px-4 pb-[.625rem] pt-2 opacity-90">
          <h1 className="relative z-10 block text-3xl font-normal text-white">
            {name}
          </h1>
          {twitter && <h2 className="text-2xl text-gray-300">@{twitter}</h2>}
          {title && <h3 className="text-xl text-gray-300">{title}</h3>}
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
      return "h-[440px] w-[509px]";
    case "sidebar-solo":
      return "h-[880px] w-[509px]";
    default:
      return "";
  }
}
