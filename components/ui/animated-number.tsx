"use client";

import { useEffect, useRef, useState } from "react";

// ─── Count-up hook ────────────────────────────────────────────────────────────
// Animates from 0 → target using easeOutExpo over `duration` ms.
// `delay` lets KPI cards stagger their entrance alongside fadeUp animations.

export function useCountUp(target: number, duration = 1100, delay = 0): number {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setValue(0);
    timerRef.current = setTimeout(() => {
      let startTime: number | null = null;

      const step = (ts: number) => {
        if (!startTime) startTime = ts;
        const t = Math.min((ts - startTime) / duration, 1);
        // easeOutExpo — fast start, smooth deceleration
        const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        setValue(target * eased);
        if (t < 1) {
          rafRef.current = requestAnimationFrame(step);
        } else {
          setValue(target); // ensure exact final value
        }
      };

      rafRef.current = requestAnimationFrame(step);
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, delay]);

  return value;
}

// ─── AnimatedNumber component ─────────────────────────────────────────────────
// Renders an animated count-up. Pass the raw numeric value and a format function.
// Falls back gracefully to the formatted static value before animation kicks in.

interface AnimatedNumberProps {
  value: number;
  format: (n: number) => string;
  duration?: number;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function AnimatedNumber({
  value,
  format,
  duration = 1100,
  delay = 0,
  className,
  style,
}: AnimatedNumberProps) {
  const animated = useCountUp(value, duration, delay);
  return (
    <span className={className} style={style}>
      {format(animated)}
    </span>
  );
}
