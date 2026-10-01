import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

const NO_REDUCED_MOTION = "(prefers-reduced-motion: no-preference)";

/**
 * Entrada escalonada (fade + slide) de los elementos que coincidan con `selector`
 * dentro del contenedor al que se asigna el ref devuelto.
 * Respeta prefers-reduced-motion.
 */
export function useStaggerIn<T extends HTMLElement>(
  selector: string,
  dependencies: unknown[] = [],
  { y = 24, stagger = 0.07, duration = 0.6 } = {},
) {
  const scope = useRef<T>(null);

  useGSAP(
    () => {
      if (!scope.current) return;
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCED_MOTION, () => {
        gsap.from(selector, {
          autoAlpha: 0,
          y,
          duration,
          ease: "power3.out",
          stagger,
          clearProps: "transform,opacity,visibility",
        });
      });
    },
    { scope, dependencies },
  );

  return scope;
}

/** Número que cuenta desde 0 hasta `value` al montarse o cambiar. */
export function CountUp({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
}: {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const fmt = (n: number) => `${prefix}${n.toFixed(decimals)}${suffix}`;

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(NO_REDUCED_MOTION, () => {
        const counter = { v: 0 };
        gsap.to(counter, {
          v: value,
          duration: 1.2,
          ease: "power2.out",
          onUpdate: () => {
            el.textContent = fmt(counter.v);
          },
          onComplete: () => {
            el.textContent = fmt(value);
          },
        });
      });
    },
    { dependencies: [value, decimals, prefix, suffix] },
  );

  return <span ref={ref}>{fmt(value)}</span>;
}
