import { useEffect, useState } from "react";
import PointCloudScene from "./PointCloudScene";
import { hideParticleLoading } from "./particleLoading";
import "./unified-particle-backdrop.css";

type Props = { lang: "zh" | "en"; paused: boolean; detail: boolean };

/** A single WebGL point cloud remains mounted while the homepage scrolls. */
export default function UnifiedParticleBackdrop({ lang, paused, detail }: Props) {
  const [interior, setInterior] = useState(detail);
  const [startSettled] = useState(() => detail || (Boolean(window.location.hash) && window.location.hash !== "#top"));

  useEffect(() => {
    if (detail) {
      hideParticleLoading();
      setInterior(true);
      return;
    }

    let scrollFrame = 0;
    const sync = () => {
      scrollFrame = 0;
      const hero = document.getElementById("top");
      const beyondHero = !hero || hero.getBoundingClientRect().bottom < window.innerHeight * 0.72;
      setInterior(beyondHero);
      if (beyondHero) hideParticleLoading();
    };
    const schedule = () => { if (!scrollFrame) scrollFrame = window.requestAnimationFrame(sync); };
    const delayed = window.setTimeout(sync, 450);
    sync();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("hashchange", schedule);
    return () => {
      window.clearTimeout(delayed);
      window.cancelAnimationFrame(scrollFrame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("hashchange", schedule);
    };
  }, [detail]);

  return (
    <div className={`unified-particle-backdrop ${interior ? "is-interior" : ""}`} aria-hidden="true">
      <PointCloudScene paused={paused} lang={lang} startSettled={startSettled} />
    </div>
  );
}
