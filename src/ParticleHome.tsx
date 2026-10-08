import { useEffect, useState } from "react";
import PointCloudScene from "./PointCloudScene";
import "./particle-home.css";

type ParticleHomeProps = { lang: "zh" | "en" };

export default function ParticleHome({ lang }: ParticleHomeProps) {
  const [paused, setPaused] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const respectReducedMotion = () => {
      if (media.matches) setPaused(true);
    };
    media.addEventListener("change", respectReducedMotion);
    return () => media.removeEventListener("change", respectReducedMotion);
  }, []);

  return (
    <section className="particle-home" id="top" aria-labelledby="particle-home-title">
      <h1 className="sr-only" id="particle-home-title">
        {lang === "zh" ? "I²Lab 智能交互技术研究实验室" : "I²Lab Intelligent Interaction Laboratory"}
      </h1>
      <div className="particle-home-scene">
        <PointCloudScene paused={paused} lang={lang} />
      </div>
      <div className="particle-home-bottom">
        <p className="particle-home-caption">HUMAN / INTELLIGENCE</p>
        <div className="particle-home-controls" data-particle-ui="true">
          <button
            className="particle-home-pause"
            type="button"
            aria-label={paused
              ? (lang === "zh" ? "继续粒子标志开场、人机塑形、流场和微浮动" : "Resume particle-logo opening, figure formation, flow and drift")
              : (lang === "zh" ? "暂停粒子标志开场、人机塑形、流场和微浮动" : "Pause particle-logo opening, figure formation, flow and drift")}
            aria-pressed={paused}
            onClick={() => setPaused((current) => !current)}
          >
            {paused ? (
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m5.5 3.75 6 4.25-6 4.25Z" /></svg>
            ) : (
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5.5 4v8M10.5 4v8" /></svg>
            )}
          </button>
        </div>
        <a className="particle-home-explore" href="#about" aria-label={lang === "zh" ? "向下探索实验室" : "Scroll to explore the laboratory"}>
          <span>{lang === "zh" ? "探索实验室" : "EXPLORE THE LAB"}</span>
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2.5v10M4.5 9 8 12.5 11.5 9" /></svg>
        </a>
      </div>
    </section>
  );
}
