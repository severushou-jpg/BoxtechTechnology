import { useEffect, useRef, useState } from "react";
import { PARTICLE_PARAMETER_RANGES, type ParticleSettings } from "./particleSettings";

type Props = {
  settings: ParticleSettings;
  lang: "zh" | "en";
  paused: boolean;
  previewProgress: number | null;
  onPreviewProgressChange: (progress: number) => void;
  onReplay: (pending: Partial<ParticleSettings>) => void;
  onChange: (key: keyof ParticleSettings, value: number) => void;
  onTogglePause: () => void;
  onResetCamera: () => void;
  onReset: () => void;
  onApplySpecified: () => void;
  canRestoreLegacy: boolean;
  onRestoreLegacy: () => void;
};

type Slider = {
  key: keyof ParticleSettings;
  label: [string, string];
  step: number;
  unit?: string;
  displayScale?: number;
};

const groups: { title: [string, string]; description?: [string, string]; sliders: Slider[] }[] = [
  { title: ["粒子光迹", "PARTICLE LIGHT TRAILS"], description: [
    "每次开场关闭扩散光迹，快速扩散结束后自动设为1；之后可在0–1内调整，0关闭。仅记录扩散粒子实际经过的路径，并随时间平滑消失；主体与开场图标不显示光迹。",
    "Diffusion trails start at zero on each opening and switch to 1 after rapid expansion. You can then adjust them within 0–1; zero disables the effect. Actual diffusion paths fade smoothly over time. The figures and opening icon have no trails.",
  ], sliders: [
    { key: "flowTrail", label: ["扩散粒子光迹", "Diffusion particle trails"], step: 0.01 },
  ] },
  { title: ["触点光色", "CONTACT COLOR"], description: [
    "调整触点中心的白色程度，默认0.85，范围0–1。",
    "Adjusts the contact center's whiteness, defaulting to 0.85 within 0–1.",
  ], sliders: [
    { key: "centerWhiteness", label: ["中心白化", "Center whiteness"], step: 0.01 },
  ] },
  { title: ["鼠标投影力场", "PROJECTED POINTER FIELD"], description: [
    "半径默认0.15世界单位，范围0.1–2.5；强度默认2，范围0–3，0关闭。粒子在球体范围内受到柔和排斥，并随鼠标移动方向沿球面偏转、向外滑出；鼠标停下后不再持续自旋，离开后逐渐回位。前后不同深度均可响应。",
    "Radius defaults to 0.15 world units within 0.1–2.5; strength defaults to 2 within 0–3, with zero disabling the force. Gentle repulsion bends particles along the sphere in the pointer's movement direction and lets them slide outward. A stationary pointer adds no continuous spin. Particles at all depths respond and gradually return after leaving.",
  ], sliders: [
    { key: "mouseFieldRadius", label: ["力场半径", "Field radius"], step: 0.05 },
    { key: "mouseFieldStrength", label: ["力场强度", "Field strength"], step: 0.05 },
  ] },
  { title: ["运动速度", "MOTION SPEED"], description: [
    "每次开场人机速度设为1.3，快速扩散固定持续1秒（包含收速），结束后自动降至0.65；暂停不计时，减弱动态模式直接使用0.65。人机速度控制标志停留、三维散射、归位及主体浮动；流场速度默认2，控制范围外的运动，两者范围0–2。快速粒子比例默认50%：较慢基准区间0.25–0.725，较快基准区间0.725–1.2，各区间连续分布；0%全慢、100%全快。内区速度按人机速度/1.2缩放，0冻结内区；流场速度0冻结外围，暂停冻结全部。",
    "Each opening sets Figure speed to 1.3; it automatically falls to 0.65 after a fixed one-second rapid expansion, including its smooth slowdown. Paused time does not count. Reduced motion starts directly at 0.65. Figure speed controls the logo hold, scatter, capture and figure drift; Flow speed defaults to 2 for motion outside the range. Both range from 0 to 2. Fast diffusion share defaults to 50%: reference slow speeds span 0.25–0.725 and fast speeds 0.725–1.2, continuously distributed. At 0% all are slow; at 100% all are fast. Inner speeds scale by Figure speed / 1.2; zero freezes that zone. Zero flow speed freezes the outskirts. Pause freezes all motion.",
  ], sliders: [
    { key: "figureSpeed", label: ["人机运动速度", "Figure speed"], step: 0.05 },
    { key: "flowSpeed", label: ["流场散发速度", "Flow speed"], step: 0.05 },
    { key: "flowSpeedBias", label: ["扩散快速粒子比例", "Fast diffusion share"], step: 0.05, unit: "%", displayScale: 100 },
  ] },
  { title: ["流场范围", "FLOW RANGE"], description: [
    "调整从触点散发的三维体积范围，默认1倍、范围0.5–2.5；放大范围不提高初始散发速度。主体轮廓的边缘发散单独设置。",
    "Sets the 3D spread from the contact, defaulting to 1× within 0.5–2.5. Increasing range keeps the initial launch speed. Figure edge dispersion is a separate control.",
  ], sliders: [
    { key: "flowRange", label: ["流场散发范围", "Flow range"], step: 0.05, unit: "×" },
  ] },
  { title: ["粒子数量分配", "PARTICLE ALLOCATION"], description: [
    "扩散粒子占比直接设置实际流场数量，范围10%–70%，其余粒子形成人机；调整比例保持总量不变。",
    "Diffusion share directly sets the actual flow count within 10%–70%; the remaining particles form the figures. Changing the ratio preserves the total count.",
  ], sliders: [
    { key: "galaxyRatio", label: ["扩散粒子占比", "Diffusion particle share"], step: 0.01, unit: "%", displayScale: 100 },
    { key: "galaxyStrength", label: ["星云强度", "Nebula strength"], step: 0.05 },
    { key: "sceneStrength", label: ["人机塑形强度", "Figure morph strength"], step: 0.05 },
  ] },
  { title: ["主体清晰度", "SUBJECT CLARITY"], description: [
    "单独减少人头、Vision Pro、机械臂和机器人头的景深与辉光。轮廓保护减弱附近星云光点和轮廓微漂移；边缘发散控制周边立体逸散，保留核心轮廓。",
    "Separately reduces depth softness and bloom for the head, Vision Pro, robotic arm, and robot head. Contour protection reduces nearby nebula light and drift; edge dispersion adds depth around the intact core contours.",
  ], sliders: [
    { key: "subjectClarity", label: ["主体清晰度", "Subject clarity"], step: 0.05 },
    { key: "contourProtection", label: ["轮廓保护", "Contour protection"], step: 0.05 },
    { key: "edgeDispersion", label: ["边缘发散", "Edge dispersion"], step: 0.05 },
  ] },
  { title: ["摄像机", "CAMERA"], sliders: [
    { key: "yawRange", label: ["水平视角范围", "Horizontal angle"], step: 0.5, unit: "°" },
    { key: "pitchRange", label: ["垂直视角范围", "Vertical angle"], step: 0.5, unit: "°" },
    { key: "cameraSmoothing", label: ["跟随缓动", "Follow smoothing"], step: 0.01, unit: "s" },
    { key: "cameraDistance", label: ["摄像机距离", "Camera distance"], step: 0.1 },
    { key: "zoom", label: ["画面缩放", "Zoom"], step: 0.01 },
    { key: "depth", label: ["点云深度", "Cloud depth"], step: 0.05 },
  ] },
  { title: ["粒子", "PARTICLES"], sliders: [
    { key: "particleCount", label: ["粒子数量", "Particle count"], step: 1000 },
    { key: "particleSize", label: ["粒子尺寸", "Particle size"], step: 0.05 },
    { key: "focus", label: ["焦点深度", "Focus depth"], step: 0.05 },
    { key: "dof", label: ["星云景深柔化", "Nebula depth softness"], step: 0.05 },
  ] },
  { title: ["光效与颜色", "LIGHT & COLOR"], sliders: [
    { key: "brightness", label: ["粒子亮度", "Brightness"], step: 0.05 },
    { key: "exposure", label: ["曝光", "Exposure"], step: 0.1 },
    { key: "bloom", label: ["辉光强度", "Bloom strength"], step: 0.01 },
    { key: "bloomRadius", label: ["辉光半径", "Bloom radius"], step: 0.1 },
    { key: "hueShift", label: ["色相偏移", "Hue shift"], step: 1, unit: "°" },
    { key: "saturation", label: ["饱和度", "Saturation"], step: 0.05 },
  ] },
  { title: ["微浮动", "FLOAT"], description: [
    "微浮动速度只调整轻微漂浮与光效节奏；人机速度控制发射与塑形，流场速度控制外围流动。",
    "Float speed adjusts only small drift and light rhythm. Figure speed controls launch and formation; flow speed controls outer transport.",
  ], sliders: [
    { key: "floatAmplitude", label: ["浮动幅度", "Float amplitude"], step: 0.05 },
    { key: "floatSpeed", label: ["微浮动速度", "Float speed"], step: 0.05 },
  ] },
];

function displayValue(value: number, step: number): string {
  const precision = step >= 1 ? 0 : step >= 0.1 ? 1 : 2;
  return Number(value.toFixed(precision)).toString();
}

function readParticleNumericDraft(draft: string, displayScale: number): number | null {
  const value = draft.trim() ? Number(draft) / displayScale : NaN;
  return Number.isFinite(value) ? value : null;
}

function ParticleSettingControl({ slider, value, labelIndex, onChange, onDraftChange }: {
  slider: Slider;
  value: number;
  labelIndex: number;
  onChange: Props["onChange"];
  onDraftChange: (key: keyof ParticleSettings, value: number | null) => void;
}) {
  const displayScale = slider.displayScale ?? 1;
  const displayStep = slider.step * displayScale;
  const [draft, setDraft] = useState(() => displayValue(value * displayScale, displayStep));
  const [editing, setEditing] = useState(false);
  const dirtyDraft = useRef(false);
  const id = `particle-setting-${slider.key}`;
  const [min, max] = PARTICLE_PARAMETER_RANGES[slider.key];

  useEffect(() => {
    if (!editing || !dirtyDraft.current) setDraft(displayValue(value * displayScale, displayStep));
  }, [editing, value, displayScale, displayStep]);

  function commitValue() {
    const next = readParticleNumericDraft(draft, displayScale);
    if (dirtyDraft.current && next !== null) onChange(slider.key, next);
    dirtyDraft.current = false;
    onDraftChange(slider.key, null);
    setEditing(false);
  }

  return (
    <div className="particle-tuning-control">
      <div className="particle-tuning-label-row">
        <label htmlFor={id}>{slider.label[labelIndex]}</label>
        <div className="particle-tuning-value">
          <input
            type="number"
            aria-label={`${slider.label[labelIndex]}${labelIndex === 0 ? "数值" : " value"}`}
            value={draft}
            min={min * displayScale}
            max={max * displayScale}
            step={displayStep}
            onFocus={() => setEditing(true)}
            onChange={(event) => {
              const next = event.currentTarget.value;
              dirtyDraft.current = true;
              setDraft(next);
              onDraftChange(slider.key, readParticleNumericDraft(next, displayScale));
            }}
            onBlur={commitValue}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.currentTarget.blur();
              if (event.key === "Escape") {
                dirtyDraft.current = false;
                setDraft(displayValue(value * displayScale, displayStep));
                onDraftChange(slider.key, null);
                setEditing(false);
              }
            }}
          />
          {slider.unit && <span>{slider.unit}</span>}
        </div>
      </div>
      <input
        id={id}
        className="particle-tuning-range"
        type="range"
        min={min}
        max={max}
        step={slider.step}
        value={value}
        aria-valuetext={`${displayValue(value * displayScale, displayStep)}${slider.unit ?? ""}`}
        onChange={(event) => onChange(slider.key, event.currentTarget.valueAsNumber)}
      />
    </div>
  );
}

export default function ParticleControls({ settings, lang, paused, previewProgress, onPreviewProgressChange, onReplay, onChange, onTogglePause, onResetCamera, onReset, onApplySpecified, canRestoreLegacy, onRestoreLegacy }: Props) {
  const [open, setOpen] = useState(() => window.matchMedia("(min-width: 900px)").matches);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "manual">("idle");
  const copyTimer = useRef<number | undefined>(undefined);
  const exportArea = useRef<HTMLTextAreaElement>(null);
  const pendingSettings = useRef<Partial<ParticleSettings>>({});
  const labelIndex = lang === "zh" ? 0 : 1;
  const previewPercent = Math.round((previewProgress ?? 0) * 100);
  const flowCount = Math.round(settings.particleCount * settings.galaxyRatio);
  const figureCount = settings.particleCount - flowCount;
  const countFormatter = new Intl.NumberFormat(lang === "zh" ? "zh-CN" : "en-US");

  useEffect(() => () => window.clearTimeout(copyTimer.current), []);

  function updateDraft(key: keyof ParticleSettings, value: number | null) {
    if (value === null) delete pendingSettings.current[key];
    else pendingSettings.current[key] = value;
  }

  useEffect(() => {
    if (copyStatus === "manual") {
      exportArea.current?.focus();
      exportArea.current?.select();
    }
  }, [copyStatus]);

  async function copySettings() {
    window.clearTimeout(copyTimer.current);
    try {
      await navigator.clipboard.writeText(JSON.stringify(settings, null, 2));
      setCopyStatus("copied");
      copyTimer.current = window.setTimeout(() => setCopyStatus("idle"), 2400);
    } catch {
      setCopyStatus("manual");
    }
  }

  return (
    <aside className={`particle-tuning${open ? " is-open" : ""}`} data-particle-ui="true" aria-label={lang === "zh" ? "粒子参数调整" : "Particle tuning"}>
      <button
        className="particle-tuning-toggle"
        type="button"
        aria-expanded={open}
        aria-controls="particle-tuning-body"
        onClick={() => setOpen((current) => !current)}
      >
        <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 3v14M10 3v14M16 3v14M2 7h4M8 13h4M14 6h4" /></svg>
        <span>{lang === "zh" ? "粒子参数" : "PARTICLE SETTINGS"}</span>
        <svg className="particle-tuning-chevron" viewBox="0 0 16 16" aria-hidden="true"><path d="m5.5 3.5 4.5 4.5-4.5 4.5" /></svg>
      </button>
      {open && (
        <div id="particle-tuning-body" className="particle-tuning-body">
          <p className="particle-tuning-hint">
            {lang === "zh" ? "移动鼠标改变视角 · 参数实时生效" : "Move your pointer to orbit · Live adjustments"}
          </p>
          <div className="particle-tuning-actions">
            <button type="button" onClick={onApplySpecified}>{lang === "zh" ? "应用指定参数" : "Apply specified settings"}</button>
            {canRestoreLegacy && <button type="button" onClick={onRestoreLegacy}>{lang === "zh" ? "恢复旧参数" : "Restore previous settings"}</button>}
          </div>
          <p className="particle-tuning-preview-hint">
            {lang === "zh" ? "应用当前指定的10万粒子配置，回正视角并预览融合终态，保留当前暂停状态。" : "Applies the current specified 100,000-particle configuration, centers the camera, and previews the final composite while keeping the current pause state."}
          </p>
          <div className="particle-tuning-groups">
            <fieldset className="particle-tuning-group particle-tuning-timeline">
              <legend>{lang === "zh" ? "开场动画" : "INTRO ANIMATION"}</legend>
              <p className="particle-tuning-timeline-label">
                {lang === "zh" ? "粒子标志 → 三维散射 → 偏转归位" : "PARTICLE LOGO → 3D SCATTER → CURVED CAPTURE"}
              </p>
              <div className="particle-tuning-label-row">
                <label htmlFor="particle-animation-preview">{lang === "zh" ? "动画预览" : "Animation preview"}</label>
                <output className="particle-tuning-preview-value" htmlFor="particle-animation-preview">
                  {previewProgress === null ? (lang === "zh" ? "自动播放" : "Autoplay") : `${previewPercent}%`}
                </output>
              </div>
              <input
                id="particle-animation-preview"
                className="particle-tuning-range"
                type="range"
                min={0}
                max={100}
                step={1}
                value={previewPercent}
                aria-valuetext={previewProgress === null ? (lang === "zh" ? "自动播放，拖动以预览" : "Autoplay; adjust to preview") : `${previewPercent}%`}
                onChange={(event) => onPreviewProgressChange(event.currentTarget.valueAsNumber / 100)}
              />
              <div className="particle-tuning-actions particle-tuning-timeline-actions">
                <button type="button" onClick={() => onPreviewProgressChange(.5)} aria-pressed={previewProgress === .5}>
                  {lang === "zh" ? "形成过程" : "Formation"}
                </button>
                <button type="button" onClick={() => onPreviewProgressChange(1)} aria-pressed={previewProgress === 1}>
                  {lang === "zh" ? "融合终态" : "Final composite"}
                </button>
                <button className="particle-tuning-replay" type="button" onClick={() => onReplay({ ...pendingSettings.current })}>
                  {lang === "zh" ? "重播开场" : "Replay intro"}
                </button>
              </div>
              <p className="particle-tuning-preview-hint">
                {lang === "zh" ? "标志停留后，粒子向三维空间自由散射，再沿弯曲轨迹捕获归位。主体基本成形后启动星云；首次快速铺展固定持续1秒，包含平滑收速，随后人机速度自动降至0.65。预览拖回前段会冻结并隐藏流场，回到终态后继续，重播才重置。暂停键冻结全部运动及铺展计时。" : "After the logo hold, particles scatter freely in 3D, then follow curved paths into their figure positions. Nebula emission starts once the figures are mostly formed. Its first rapid fill lasts exactly one active second, including a smooth slowdown, then Figure speed falls to 0.65. Early preview freezes and hides the flow; returning to the final phase resumes it. Replay resets it. Pause freezes all motion and the fill timer."}
              </p>
            </fieldset>
            {groups.map((group) => (
              <fieldset className="particle-tuning-group" key={group.title[1]}>
                <legend>{group.title[labelIndex]}</legend>
                {group.sliders.map((slider) => (
                  <ParticleSettingControl key={slider.key} slider={slider} value={settings[slider.key]} labelIndex={labelIndex} onChange={onChange} onDraftChange={updateDraft} />
                ))}
                {group.description && <p className="particle-tuning-preview-hint">{group.description[labelIndex]}</p>}
                {group.sliders.some((slider) => slider.key === "galaxyRatio") && (
                  <p className="particle-tuning-preview-hint" aria-live="polite">
                    {lang === "zh"
                      ? `扩散粒子 ${countFormatter.format(flowCount)} · 人机粒子 ${countFormatter.format(figureCount)} · 总量 ${countFormatter.format(settings.particleCount)}`
                      : `Flow ${countFormatter.format(flowCount)} · Figures ${countFormatter.format(figureCount)} · Total ${countFormatter.format(settings.particleCount)}`}
                  </p>
                )}
              </fieldset>
            ))}
          </div>
          <div className="particle-tuning-actions">
            <button type="button" onClick={onTogglePause} aria-pressed={paused}>
              {paused ? (lang === "zh" ? "继续动画" : "Resume animation") : (lang === "zh" ? "暂停动画" : "Pause animation")}
            </button>
            <button type="button" onClick={onResetCamera}>{lang === "zh" ? "视角回正" : "Center camera"}</button>
            <button type="button" onClick={onReset}>{lang === "zh" ? "恢复默认" : "Reset defaults"}</button>
            <button type="button" onClick={copySettings}>
              {copyStatus === "copied" ? (lang === "zh" ? "已复制" : "Copied") : (lang === "zh" ? "复制参数" : "Copy settings")}
            </button>
          </div>
          <p className="particle-tuning-footnote">
            {lang === "zh" ? "参数自动保存；新默认不会被旧设置覆盖，可手动恢复旧参数，缺少的新参数使用默认值。暂停冻结形成、流场及微浮动，仍可移动视角。" : "Settings save automatically. Older settings do not replace new defaults; you can restore them manually, with missing parameters filled from defaults. Pause freezes formation, flow and drift; the camera still follows."}
          </p>
          {copyStatus === "manual" && (
            <label className="particle-tuning-export">
              <span>{lang === "zh" ? "请手动复制以下参数：" : "Copy these settings manually:"}</span>
              <textarea ref={exportArea} readOnly rows={5} value={JSON.stringify(settings, null, 2)} />
            </label>
          )}
          <span className="sr-only" role="status" aria-live="polite">
            {copyStatus === "copied" ? (lang === "zh" ? "参数已复制到剪贴板" : "Settings copied to clipboard") : ""}
          </span>
        </div>
      )}
    </aside>
  );
}
