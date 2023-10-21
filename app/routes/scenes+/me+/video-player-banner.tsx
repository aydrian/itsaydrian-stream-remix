import { Icon } from "~/components/icon";
import atticusAndMe from "~/images/atticus-and-me.png";

export default function VideoPlayerBanner() {
  return (
    <div className="flex h-screen w-screen items-center justify-between bg-blue-950 text-white">
      <div className="h-full grow bg-gradient-to-r from-cyan-500 to-green-500 p-8">
        <div className="flex h-full grow flex-col items-center justify-center rounded-lg bg-blue-950 bg-opacity-75 shadow">
          <div className="flex h-full grow flex-col items-center justify-center gap-1.5">
            <h1 className="max-w-fit bg-gradient-to-r from-cyan-500 to-green-500 bg-clip-text text-center text-9xl font-bold leading-tight text-transparent">
              It's Aydrian
            </h1>
            <h2 className="text-7xl font-semibold leading-tight">
              Hoosier in the Big City
            </h2>
            <h3 className="max-w-fit bg-gradient-to-r from-cyan-500 to-green-500 bg-clip-text text-5xl font-bold leading-tight text-transparent">
              Corgi Dad · Uncle · Nerd
            </h3>
          </div>
          <ul className="flex w-full items-center justify-around  p-12 text-4xl font-medium">
            <li className="flex items-center gap-2">
              <Icon className="h-8 w-8" name="twitter" />
              <Icon className="h-8 w-8" name="instagram" />
              <Icon className="h-8 w-8" name="twitch" />
              <span>itsaydrian</span>
            </li>
            <li className="flex items-center gap-2">
              <Icon className="h-8 w-8" name="github" />
              <span>aydrian</span>
            </li>
            <li className="flex items-center gap-2">
              <Icon className="h-8 w-8" name="home" />
              <span>itsaydrian.com</span>
            </li>
          </ul>
        </div>
      </div>
      <img alt="Atticus and Me" height="1080" src={atticusAndMe} width="810" />
    </div>
  );
}
