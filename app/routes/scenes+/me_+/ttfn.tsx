import { gsap } from "gsap";
import { useEffect, useRef } from "react";
import SplitType from "split-type";

export default function TTFN() {
  const target = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (target.current) {
      const text = new SplitType(target.current, {
        charClass: "char translate-y-full",
        types: "words, chars"
      });
      gsap.set(target.current, { visibility: "visible" });
      gsap.to(text.chars, {
        delay: 0.03,
        duration: 1,
        repeat: -1,
        repeatDelay: 0.7,
        stagger: 0.1,
        y: 0
      });
    }
  }, [target]);

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-blue-950 text-white">
      <h1 className="mb-4 bg-gradient-to-r from-cyan-500 to-green-500 bg-clip-text text-9xl font-bold leading-tight text-transparent">
        TTFN
      </h1>
      <h2
        style={{
          clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)",
          visibility: "hidden"
        }}
        className="text-7xl font-bold leading-tight text-cyan-500"
        ref={target}
      >
        Ta-Ta For Now 👋
      </h2>
    </div>
  );
}
