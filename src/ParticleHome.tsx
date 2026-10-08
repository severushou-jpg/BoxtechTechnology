import { useEffect, useRef, useState } from "react";
import PointCloudScene from "./PointCloudScene";
import ParticleControls from "./ParticleControls";
import { OPENING_FIGURE_SPEED, SETTLED_FIGURE_SPEED, OPENING_FLOW_TRAIL, SETTLED_FLOW_TRAIL } from "./particleFigureSpeed";
import {
  DEFAULT_PARTICLE_SETTINGS,
  SPECIFIED_PARTICLE_PRESET,
  NEWEST_LEGACY_PARTICLE_SETTINGS_STORAGE_KEY,
  PRIOR_PARTICLE_SETTINGS_STORAGE_KEY,
  RECENT_PARTICLE_SETTINGS_STORAGE_KEY,
  PREVIOUS_PARTICLE_SETTINGS_STORAGE_KEY,
  LEGACY_PARTICLE_SETTINGS_STORAGE_KEY,
  OLDER_PARTICLE_SETTINGS_STORAGE_KEY,
  OLDEST_PARTICLE_SETTINGS_STORAGE_KEY,
  EARLIEST_PARTICLE_SETTINGS_STORAGE_KEY,
  normalizeParticleSettings,
  PARTICLE_SETTINGS_STORAGE_KEY,
  type ParticleSettings,
} from "./particleSettings";
import "./particle-home.css";

type ParticleHomeProps = { lang: "zh" | "en"; showControls?: boolean };

function readSavedParticleSettings(key: string): ParticleSettings | null {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    const parsed: unknown = JSON.parse(stored);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    const input = parsed as Record<string, unknown>;
    const hasSettings = Object.keys(DEFAULT_PARTICLE_SETTINGS).some((settingKey) =>
      typeof input[settingKey] === "number" && Number.isFinite(input[settingKey]));
    // Existing current and manually restored older presets retain custom values;
    // normalization supplies any missing fields, including the fast diffusion share.
    return hasSettings ? normalizeParticleSettings(parsed) : null;
  } catch {
    return null;
  }
}

function readParticleSettings(reducedMotion = false): ParticleSettings {
  const saved = readSavedParticleSettings(PARTICLE_SETTINGS_STORAGE_KEY) ?? { ...DEFAULT_PARTICLE_SETTINGS };
  return { ...saved, figureSpeed: reducedMotion ? SETTLED_FIGURE_SPEED : OPENING_FIGURE_SPEED, introTrail: 0, flowTrail: reducedMotion ? SETTLED_FLOW_TRAIL : OPENING_FLOW_TRAIL };
}

function readLegacyParticleSettings(): ParticleSettings | null {
  return readSavedParticleSettings(NEWEST_LEGACY_PARTICLE_SETTINGS_STORAGE_KEY)
    ?? readSavedParticleSettings(PRIOR_PARTICLE_SETTINGS_STORAGE_KEY)
    ?? readSavedParticleSettings(RECENT_PARTICLE_SETTINGS_STORAGE_KEY)
    ?? readSavedParticleSettings(PREVIOUS_PARTICLE_SETTINGS_STORAGE_KEY)
    ?? readSavedParticleSettings(LEGACY_PARTICLE_SETTINGS_STORAGE_KEY)
    ?? readSavedParticleSettings(OLDER_PARTICLE_SETTINGS_STORAGE_KEY)
    ?? readSavedParticleSettings(OLDEST_PARTICLE_SETTINGS_STORAGE_KEY)
    ?? readSavedParticleSettings(EARLIEST_PARTICLE_SETTINGS_STORAGE_KEY);
}

function buildParticleReplaySettings(current: ParticleSettings, pending: Partial<ParticleSettings>): ParticleSettings {
  return { ...normalizeParticleSettings({ ...current, ...pending }), figureSpeed: OPENING_FIGURE_SPEED, introTrail: 0, flowTrail: OPENING_FLOW_TRAIL };
}

export default function ParticleHome(props: ParticleHomeProps) {
  // A new storage revision also starts a new live state, so hot updates cannot
  // carry the previous revision's values into its first save.
  return <ParticleHomeState key={PARTICLE_SETTINGS_STORAGE_KEY} {...props} />;
}

function ParticleHomeState({ lang, showControls = false }: ParticleHomeProps) {
  const [settings, setSettings] = useState(() => readParticleSettings(window.matchMedia("(prefers-reduced-motion: reduce)").matches));
  const settingsRef = useRef(settings);
  const [replaySettings, setReplaySettings] = useState<ParticleSettings | undefined>(undefined);
  const [legacySettings] = useState(readLegacyParticleSettings);
  const [cameraResetKey, setCameraResetKey] = useState(0);
  const [replayKey, setReplayKey] = useState(0);
  const [previewProgress, setPreviewProgress] = useState<number | null>(null);
  const [paused, setPaused] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  function applySettings(next: ParticleSettings) {
    // Blur can commit a numeric draft immediately before the replay click.
    // Keep the action snapshot current even before React renders that commit.
    const normalized = normalizeParticleSettings(next);
    settingsRef.current = normalized;
    setSettings(normalized);
  }

  useEffect(() => {
    try {
      localStorage.setItem(PARTICLE_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Live controls remain usable when browser storage is unavailable.
    }
  }, [settings]);

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
        <PointCloudScene
          settings={settings}
          paused={paused}
          lang={lang}
          cameraResetKey={cameraResetKey}
          replayKey={replayKey}
          replaySettings={replaySettings}
          previewProgress={previewProgress}
          onFigureSpeedChange={(value) => applySettings({ ...settingsRef.current, figureSpeed: value })}
          onFlowTrailChange={(value) => applySettings({ ...settingsRef.current, flowTrail: value })}
        />
      </div>
      {showControls && <ParticleControls
        settings={normalizeParticleSettings(settings)}
        lang={lang}
        paused={paused}
        previewProgress={previewProgress}
        onPreviewProgressChange={setPreviewProgress}
        onReplay={(pending) => {
          const snapshot = buildParticleReplaySettings(settingsRef.current, pending);
          applySettings(snapshot);
          setReplaySettings(snapshot);
          setPreviewProgress(null);
          setReplayKey((current) => current + 1);
          setPaused(false);
        }}
        onChange={(key, value) => applySettings({ ...settingsRef.current, [key]: value })}
        onTogglePause={() => setPaused((current) => !current)}
        onResetCamera={() => setCameraResetKey((current) => current + 1)}
        onReset={() => {
          applySettings({ ...DEFAULT_PARTICLE_SETTINGS });
          setCameraResetKey((current) => current + 1);
        }}
        onApplySpecified={() => {
          applySettings({ ...SPECIFIED_PARTICLE_PRESET });
          setCameraResetKey((current) => current + 1);
          setPreviewProgress(1);
        }}
        canRestoreLegacy={legacySettings !== null}
        onRestoreLegacy={() => {
          if (!legacySettings) return;
          applySettings({ ...legacySettings });
          setCameraResetKey((current) => current + 1);
          setPreviewProgress(1);
        }}
      />}
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
