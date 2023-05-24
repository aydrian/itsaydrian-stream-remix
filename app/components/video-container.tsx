import clsx from "clsx";

type props = {
  name?: string;
  twitter?: string;
  title?: string;
  className?: string;
};

export function VideoContainer({
  name = "Aydrian Howard",
  twitter,
  title,
  className
}: props) {
  return (
    <figure
      className={clsx(
        className,
        `relative m-0 flex grow flex-col items-center justify-end`
      )}
    >
      <div className="h-full w-full" />

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
