import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import SplitType from "split-type";

export default function TTFN() {
  const target = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (target.current) {
      const text = new SplitType(target.current, {
        types: "words, chars",
        charClass: "char translate-y-full"
      });
      gsap.set(target.current, { visibility: "visible" });
      gsap.to(text.chars, {
        y: 0,
        stagger: 0.1,
        delay: 0.03,
        duration: 1,
        repeat: -1,
        repeatDelay: 0.7
      });
    }
  }, [target]);

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-blue-950 text-white">
      <h1 className="mb-4 bg-gradient-to-r from-cyan-500 to-green-500 bg-clip-text text-9xl font-bold leading-tight text-transparent">
        TTFN
      </h1>
      <h2
        ref={target}
        className="text-7xl font-bold leading-tight text-cyan-500"
        style={{
          visibility: "hidden",
          clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)"
        }}
      >
        Ta-Ta For Now 👋
      </h2>
    </div>
  );
}
