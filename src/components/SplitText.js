import React, { useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";

/**
 * SplitText (no GSAP SplitText plugin required)
 * Props:
 *  - text (string)
 *  - className
 *  - delay (ms between items)
 *  - duration (s)
 *  - ease (string)
 *  - splitType: "chars" | "words" | "lines"
 *  - from, to: gsap vars
 *  - threshold (0..1), rootMargin (string) used by IntersectionObserver
 *  - textAlign
 *  - loop (bool), loopDelay (s), yoyo (bool)
 *  - color (string)
 *  - onLetterAnimationComplete callback
 */
const SplitText = ({
  text = "",
  className = "",
  delay = 100,
  duration = 0.6,
  ease = "power3.out",
  splitType = "chars",
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = "-100px",
  textAlign = "center",
  color,
  loop = false,
  loopDelay = 0,
  yoyo = false,
  onLetterAnimationComplete,
}) => {
  const containerRef = useRef(null);
  const itemRefs = useRef([]);
  itemRefs.current = [];

  const addItemRef = (el) => {
    if (el && !itemRefs.current.includes(el)) itemRefs.current.push(el);
  };

  const tokens = useMemo(() => {
    if (!text) return [];
    switch (splitType) {
      case "words": {
        const parts = text.split(/(\s+)/);
        // keep spaces as separate tokens so layout is preserved
        return parts.map((p) => (p === " " ? "\u00A0" : p));
      }
      case "chars": {
        return Array.from(text).map((ch) => (ch === " " ? "\u00A0" : ch));
      }
      case "lines":
      default: {
        // render words to measure lines; the tokens are words & spaces
        const parts = text.split(/(\s+)/);
        return parts.map((p) => (p === " " ? "\u00A0" : p));
      }
    }
  }, [text, splitType]);

  useEffect(() => {
    const el = containerRef.current;
    const items = itemRefs.current;
    if (!el || !items.length) return;

    // Helper to build animation timeline
    const buildTimeline = () => {
      const tl = gsap.timeline({
        paused: true,
        defaults: { duration, ease, overwrite: "auto" },
        onComplete: () => {
          onLetterAnimationComplete && onLetterAnimationComplete();
        },
        repeat: loop ? -1 : 0,
        yoyo,
        repeatDelay: loop ? loopDelay : 0,
      });

      // set initial
      gsap.set(items, { ...from, willChange: "transform, opacity" });

      if (splitType === "lines") {
        // group items by line using offsetTop
        const groups = [];
        const byTop = {};
        const tolerance = 2;
        items.forEach((it) => {
          const top = Math.round(it.offsetTop / tolerance) * tolerance;
          if (!byTop[top]) byTop[top] = [];
          byTop[top].push(it);
        });
        Object.keys(byTop)
          .sort((a, b) => Number(a) - Number(b))
          .forEach((k) => groups.push(byTop[k]));

        groups.forEach((group, i) => {
          tl.to(
            group,
            { ...to, duration, ease, stagger: 0, clearProps: "willChange" },
            i * (delay / 1000)
          );
        });
      } else {
        tl.to(items, {
          ...to,
          duration,
          ease,
          stagger: delay / 1000,
          clearProps: "willChange",
        });
      }

      return tl;
    };

    let tl = buildTimeline();

    // IO to play/pause when in viewport
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            tl.restart(true, false);
          } else {
            if (loop) tl.pause();
          }
        });
      },
      { root: null, rootMargin, threshold }
    );
    io.observe(el);

    return () => {
      io.disconnect();
      tl && tl.kill();
      gsap.killTweensOf(items);
    };
  }, [text, splitType, delay, duration, ease, from, to, threshold, rootMargin, loop, loopDelay, yoyo, onLetterAnimationComplete]);

  return (
    <p
      ref={containerRef}
      className={`split-parent ${className || ""}`}
      style={{
        textAlign,
        overflow: "hidden",
        display: "inline-block",
        whiteSpace: "normal",
        wordWrap: "break-word",
        color: color || undefined,
      }}
    >
      {tokens.map((tok, idx) => (
        <span
          key={idx}
          ref={addItemRef}
          className="split-item"
          style={{ display: "inline-block" }}
        >
          {tok}
        </span>
      ))}
    </p>
  );
};

export default SplitText;
