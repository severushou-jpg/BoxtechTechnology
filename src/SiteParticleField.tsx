import { useEffect, useRef, useState } from "react";
import { hideParticleLoading } from "./particleLoading";
import "./site-particle-field.css";

type Scene = "top" | "about" | "opportunities" | "alumni" | "available-projects" | "projects" | "work" | "team" | "publications" | "closing";
type Point = { x: number; y: number; tx: number; ty: number; seed: number; size: number; warm: boolean };

const sceneIds: Scene[] = ["top", "about", "opportunities", "alumni", "available-projects", "projects", "work", "team", "publications", "closing"];
const fract = (value: number) => value - Math.floor(value);
const hash = (value: number) => fract(Math.sin(value * 127.1 + 311.7) * 43758.5453);

// One persistent set of particles morphs between research themes. The homepage
// keeps the original WebGL point cloud; this lighter field carries its palette,
// point scale and motion language through long reading sections and detail pages.
function target(index: number, count: number, scene: Scene, width: number, height: number, time: number): [number, number] {
  const u = index / count;
  const v = hash(index + 19);
  const w = hash(index + 87);
  const spread = 0.82 + w * 0.36;
  const angle = u * Math.PI * 2 * 6 + v * 0.2;
  let x = 0.73;
  let y = 0.5;

  switch (scene) {
    case "about": { // A nested interaction field, echoing the I²Lab mark.
      const ring = index % 3;
      const radius = (0.13 + ring * 0.072) * spread;
      x += Math.cos(angle) * radius * height / width;
      y += Math.sin(angle) * radius;
      break;
    }
    case "opportunities": { // An open research gateway with two trajectories.
      const side = index % 2 ? 1 : -1;
      y = 0.14 + u * 0.72;
      x += side * (0.095 + 0.05 * Math.sin(u * Math.PI * 2.5)) + (v - 0.5) * 0.025;
      break;
    }
    case "alumni": { // Three branching graduate pathways.
      const path = index % 3;
      y = 0.12 + u * 0.78;
      x += (path - 1) * 0.11 + Math.sin(u * Math.PI * 1.5 + path * 0.9) * 0.04;
      break;
    }
    case "available-projects": { // Research openings as connected nodes.
      const node = index % 3;
      const a = u * Math.PI * 2 * 4;
      x += (node - 1) * 0.11 + Math.cos(a) * 0.035 * height / width;
      y = 0.27 + node * 0.24 + Math.sin(a) * 0.045;
      break;
    }
    case "projects": { // Two related, but distinct, clinical programmes.
      const orbit = index % 2;
      const a = u * Math.PI * 2 * 5;
      x += (orbit ? 0.075 : -0.075) + Math.cos(a) * 0.12 * height / width;
      y = (orbit ? 0.61 : 0.38) + Math.sin(a) * 0.15;
      break;
    }
    case "work": { // Field recordings and research translated into practice.
      x = 0.45 + u * 0.5;
      y = 0.5 + Math.sin(u * Math.PI * 5 + time * 0.18) * 0.12 + (v - 0.5) * 0.07;
      break;
    }
    case "team": { // Four intersecting areas of expertise.
      const node = index % 4;
      const a = u * Math.PI * 2 * 7;
      x = 0.58 + (node % 2) * 0.2 + Math.cos(a) * 0.08 * height / width;
      y = 0.35 + Math.floor(node / 2) * 0.28 + Math.sin(a) * 0.09;
      break;
    }
    case "publications": { // Parallel lines of evidence, like a research index.
      const row = index % 9;
      x = 0.56 + u * 0.38;
      y = 0.22 + row * 0.068 + Math.sin(u * Math.PI * 4 + row) * 0.009;
      break;
    }
    case "closing": { // Return to the nested diamond, closing the visual loop.
      const a = u * 4;
      const side = Math.floor(a) % 4;
      const fraction = fract(a);
      const radius = 0.18 + (index % 3) * 0.05;
      const diamondX = [0, 1, 0, -1, 0];
      const diamondY = [-1, 0, 1, 0, -1];
      x = 0.73 + (diamondX[side] + (diamondX[side + 1] - diamondX[side]) * fraction) * radius * height / width;
      y = 0.5 + (diamondY[side] + (diamondY[side + 1] - diamondY[side]) * fraction) * radius;
      break;
    }
    default: { // Detail pages get the same calm field as their parent section.
      x += Math.cos(angle) * 0.19 * height / width;
      y += Math.sin(angle) * 0.19;
    }
  }

  const scatter = index % 7 === 0 ? 0.11 : 0.026;
  return [(x + (v - 0.5) * scatter) * width, (y + (w - 0.5) * scatter) * height];
}

function getScene(): Scene {
  if (window.location.pathname.startsWith("/opportunities/")) return "opportunities";
  if (window.location.pathname.startsWith("/projects/")) return "projects";
  if (window.location.pathname.startsWith("/alumni/")) return "alumni";
  const marker = window.innerHeight * 0.46;
  const sections = document.querySelectorAll<HTMLElement>("main > section[id]");
  for (const section of sections) {
    const bounds = section.getBoundingClientRect();
    if (bounds.top <= marker && bounds.bottom > marker && sceneIds.includes(section.id as Scene)) return section.id as Scene;
  }
  const closing = document.querySelector(".closing-section");
  if (closing && closing.getBoundingClientRect().top <= marker) return "closing";
  return "top";
}

export default function SiteParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scene, setScene] = useState<Scene>(() => window.location.pathname === "/" ? "top" : getScene());

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const points: Point[] = [];
    let currentScene = getScene();
    let width = 0;
    let height = 0;
    let frame = 0;
    let lastDraw = 0;
    let lastTarget = 0;
    let pendingScroll = 0;
    let delayedSync = 0;
    let visible = !document.hidden;
    const pointer = { x: -1000, y: -1000 };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const desired = Math.round(Math.min(width < 700 ? 900 : 1900, Math.max(520, width * height / 650)));
      points.length = desired;
      for (let i = 0; i < desired; i++) {
        const [tx, ty] = target(i, desired, currentScene, width, height, 0);
        points[i] = { x: tx, y: ty, tx, ty, seed: hash(i + 1), size: 0.55 + hash(i + 51) * 1.15, warm: hash(i + 511) > 0.71 };
      }
      draw(0, true);
    };

    const syncSection = () => {
      pendingScroll = 0;
      const next = getScene();
      if (next !== currentScene) {
        currentScene = next;
        lastTarget = 0;
      }
      // The homepage GPU renderer deliberately sleeps off-screen. On a direct
      // #section visit it cannot draw its first frame to dismiss the loader.
      if (next !== "top") hideParticleLoading();
      setScene(next);
    };
    const scheduleSection = () => { if (!pendingScroll) pendingScroll = window.requestAnimationFrame(syncSection); };
    const onPointer = (event: PointerEvent) => { pointer.x = event.clientX; pointer.y = event.clientY; };
    const onPointerOut = () => { pointer.x = -1000; pointer.y = -1000; };
    const onVisibility = () => {
      visible = !document.hidden;
      if (visible && !frame) frame = window.requestAnimationFrame(tick);
    };

    function draw(time: number, settle = false) {
      if (!context) return;
      context.clearRect(0, 0, width, height);
      if (currentScene === "top") return;
      const count = points.length;
      if (time - lastTarget > 110 || settle) {
        for (let i = 0; i < count; i++) {
          const [tx, ty] = target(i, count, currentScene, width, height, reducedMotion.matches ? 0 : time * 0.001);
          points[i].tx = tx;
          points[i].ty = ty;
        }
        lastTarget = time;
      }
      context.globalCompositeOperation = "screen";
      for (let i = 0; i < count; i++) {
        const point = points[i];
        const ease = settle || reducedMotion.matches ? 1 : 0.035 + point.seed * 0.018;
        point.x += (point.tx - point.x) * ease;
        point.y += (point.ty - point.y) * ease;
        const phase = (reducedMotion.matches ? 0 : time * 0.0003) + point.seed * 20;
        const drift = reducedMotion.matches ? 0 : Math.sin(phase) * 2.5;
        const dx = point.x - pointer.x;
        const dy = point.y - pointer.y;
        const distance = Math.hypot(dx, dy);
        const push = !reducedMotion.matches && distance < 90 ? (90 - distance) / 90 * 11 : 0;
        const x = point.x + drift + (distance ? dx / distance * push : 0);
        const y = point.y + drift * 0.45 + (distance ? dy / distance * push : 0);
        const alpha = (0.22 + point.seed * 0.47) * (0.8 + Math.sin(phase * 2) * 0.2);
        context.fillStyle = point.warm ? `rgba(239,64,86,${alpha})` : `rgba(224,232,239,${alpha * 0.8})`;
        context.beginPath();
        context.arc(x, y, point.size, 0, Math.PI * 2);
        context.fill();
      }
      context.globalCompositeOperation = "source-over";
    }

    function tick(time: number) {
      frame = 0;
      if (!visible) return;
      if (time - lastDraw >= (reducedMotion.matches ? 1000 : 32)) {
        draw(time);
        lastDraw = time;
      }
      frame = window.requestAnimationFrame(tick);
    }

    resize();
    syncSection();
    // Native hash restoration can happen after React effects have mounted.
    delayedSync = window.setTimeout(syncSection, 450);
    frame = window.requestAnimationFrame(tick);
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", scheduleSection, { passive: true });
    window.addEventListener("hashchange", scheduleSection);
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerout", onPointerOut);
    document.addEventListener("visibilitychange", onVisibility);
    reducedMotion.addEventListener("change", resize);
    return () => {
      window.cancelAnimationFrame(frame);
      window.cancelAnimationFrame(pendingScroll);
      window.clearTimeout(delayedSync);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", scheduleSection);
      window.removeEventListener("hashchange", scheduleSection);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerout", onPointerOut);
      document.removeEventListener("visibilitychange", onVisibility);
      reducedMotion.removeEventListener("change", resize);
    };
  }, []);

  return <div className="site-particle-field" data-scene={scene} aria-hidden="true"><canvas ref={canvasRef} /></div>;
}
