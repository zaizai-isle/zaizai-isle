"use client";

import { useEffect, useId, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import paperFiber from "../../../assets/achievement/paper-fiber.webp";

interface AdaptivePaperProps {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  seed?: number;
  style?: CSSProperties;
}

interface PaperSize {
  width: number;
  height: number;
}

function edgeNoise(index: number, seed: number) {
  const value = Math.sin((index + 1) * 12.9898 + seed * 78.233) * 43758.5453;
  return (value - Math.floor(value)) * 2 - 1;
}

function buildPaperPath(width: number, height: number, seed: number) {
  const safeWidth = Math.max(width, 80);
  const safeHeight = Math.max(height, 80);
  const inset = 5;
  const corner = Math.min(10, safeWidth * 0.04, safeHeight * 0.04);
  const amplitude = Math.min(4.5, Math.max(2.2, Math.min(safeWidth, safeHeight) * 0.008));
  const spacing = 18;
  const points: Array<[number, number]> = [];
  let noiseIndex = 0;

  const topSteps = Math.max(3, Math.ceil((safeWidth - corner * 2) / spacing));
  for (let index = 0; index <= topSteps; index += 1) {
    const progress = index / topSteps;
    points.push([
      corner + (safeWidth - corner * 2) * progress,
      inset + edgeNoise(noiseIndex, seed) * amplitude,
    ]);
    noiseIndex += 1;
  }

  const rightSteps = Math.max(3, Math.ceil((safeHeight - corner * 2) / spacing));
  for (let index = 0; index <= rightSteps; index += 1) {
    const progress = index / rightSteps;
    points.push([
      safeWidth - inset + edgeNoise(noiseIndex, seed) * amplitude,
      corner + (safeHeight - corner * 2) * progress,
    ]);
    noiseIndex += 1;
  }

  for (let index = topSteps; index >= 0; index -= 1) {
    const progress = index / topSteps;
    points.push([
      corner + (safeWidth - corner * 2) * progress,
      safeHeight - inset + edgeNoise(noiseIndex, seed) * amplitude,
    ]);
    noiseIndex += 1;
  }

  for (let index = rightSteps; index >= 0; index -= 1) {
    const progress = index / rightSteps;
    points.push([
      inset + edgeNoise(noiseIndex, seed) * amplitude,
      corner + (safeHeight - corner * 2) * progress,
    ]);
    noiseIndex += 1;
  }

  return `${points.map(([x, y], index) => `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`).join(" ")} Z`;
}

export function AdaptivePaper({ children, className = "", contentClassName = "", seed = 7, style }: AdaptivePaperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<PaperSize>({ width: 100, height: 100 });
  const patternId = `paper-fiber-${useId().replaceAll(":", "")}`;
  const washId = `paper-wash-${useId().replaceAll(":", "")}`;

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    let frame = 0;
    const measure = () => {
      const rect = element.getBoundingClientRect();
      const nextWidth = Math.max(1, Math.round(rect.width));
      const nextHeight = Math.max(1, Math.round(rect.height));
      setSize((current) => current.width === nextWidth && current.height === nextHeight
        ? current
        : { width: nextWidth, height: nextHeight });
    };
    const scheduleMeasure = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(measure);
    };

    measure();
    const observer = new ResizeObserver(scheduleMeasure);
    observer.observe(element);
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, []);

  const paperPath = useMemo(
    () => buildPaperPath(size.width, size.height, seed),
    [seed, size.height, size.width],
  );

  return (
    <div ref={containerRef} className={`adaptive-paper relative isolate ${className}`} style={style}>
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
        viewBox={`0 0 ${size.width} ${size.height}`}
        preserveAspectRatio="none"
      >
        <defs>
          <pattern id={patternId} width="320" height="188" patternUnits="userSpaceOnUse">
            <image href={paperFiber.src} width="320" height="188" preserveAspectRatio="xMidYMid slice" />
          </pattern>
          <radialGradient id={washId} cx="32%" cy="18%" r="88%">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.42" />
            <stop offset="0.58" stopColor="#f5f0e3" stopOpacity="0.14" />
            <stop offset="1" stopColor="#ded8c8" stopOpacity="0.2" />
          </radialGradient>
        </defs>
        <path d={paperPath} fill="#f4f0e5" stroke="#d8d2c3" strokeOpacity="0.24" />
        <path d={paperPath} fill={`url(#${patternId})`} opacity="0.66" />
        <path d={paperPath} fill={`url(#${washId})`} />
      </svg>
      <div className={`relative z-[1] ${contentClassName}`}>{children}</div>
    </div>
  );
}
