import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "@wordpress/element";

// CSS – inject để chắc chắn có ở frontend
const CT_CSS = `
.circular-text{position:relative;width:var(--diameter,160px);height:var(--diameter,160px);display:inline-block}
.circular-text__spinner{position:absolute;inset:0;animation:ct-rotate var(--spin-duration,20s) linear infinite;transform-origin:50% 50%}
.circular-text__char{position:absolute;left:50%;top:50%;transform-origin:0 0;white-space:pre}
@keyframes ct-rotate{to{transform:rotate(360deg)}}
.circular-text[data-hover="pause"]:hover .circular-text__spinner{animation-play-state:paused}
.circular-text[data-hover="speedUp"]:hover .circular-text__spinner{animation-duration:calc(var(--spin-duration,20s)/2)}
.circular-text[data-hover="slowDown"]:hover .circular-text__spinner{animation-duration:calc(var(--spin-duration,20s)*2)}
.circular-text[data-hover="goBonkers"]:hover .circular-text__spinner{animation-duration:calc(var(--spin-duration,20s)/10)}
`;
function ensureCircularStyle() {
  if (typeof document === "undefined") return;
  if (document.getElementById("bbta-circular-style")) return;
  const style = document.createElement("style");
  style.id = "bbta-circular-style";
  style.textContent = CT_CSS;
  document.head.appendChild(style);
}

/**
 * CircularText — đặt ký tự theo vòng tròn với spacing tỉ lệ theo độ rộng thực tế.
 *
 * Props:
 * - text: string
 * - spinDuration: number (s) – thời gian quay 1 vòng. Default 20
 * - onHover: '' | 'slowDown' | 'speedUp' | 'pause' | 'goBonkers'
 * - radius: number (px) – bán kính. Default 80
 * - spacing: 'proportional' | 'equal' – mặc định 'proportional'
 * - spaceRatio: number – hệ số cho dấu cách (0.6 = 60% độ rộng đo được). Default 0.6
 * - startAngle: number (deg) – góc bắt đầu, mặc định -90 (đỉnh trên)
 * - reverse: boolean – đảo chiều bố cục chữ quanh tâm. Default false
 * - className: string
 */
const CircularText = ({
  text = "",
  spinDuration = 20,
  onHover = "",
  radius = 80,
  spacing = "proportional",
  spaceRatio = 0.6,
  startAngle = -90,
  reverse = false,
  className = "",
}) => {
  ensureCircularStyle();
  const containerRef = useRef(null);

  const chars = useMemo(() => Array.from(String(text)), [text]);
  const [centers, setCenters] = useState(() => {
    const n = Math.max(chars.length, 1);
    const step = 360 / n;
    return Array.from({ length: n }, (_, i) => i * step + step / 2);
  });

  // tính góc trung tâm cho từng ký tự
  const computeCenters = async () => {
    const el = containerRef.current;
    if (!el || chars.length === 0) return;

    // chờ font sẵn sàng để đo chính xác
    try { if (document.fonts && document.fonts.ready) await document.fonts.ready; } catch {}

    // equal spacing?
    if (spacing !== "proportional") {
      const n = Math.max(chars.length, 1);
      const step = 360 / n;
      setCenters(Array.from({ length: n }, (_, i) => i * step + step / 2));
      return;
    }

    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const cs = window.getComputedStyle(el);
      const font =
        cs.font ||
        `${cs.fontStyle || "normal"} ${cs.fontVariant || "normal"} ${cs.fontWeight || 400} ${cs.fontSize || "16px"} / ${cs.lineHeight || "normal"} ${cs.fontFamily || "sans-serif"}`;
      ctx.font = font;

      let letterSpacing = 0;
      if (cs.letterSpacing && cs.letterSpacing !== "normal") {
        const m = /(-?\d+(\.\d+)?)(px)?/.exec(cs.letterSpacing);
        if (m) letterSpacing = parseFloat(m[1]) || 0;
      }

      const widths = chars.map((ch) => {
        let w = ctx.measureText(ch).width + letterSpacing;
        if (!Number.isFinite(w) || w <= 0) w = 1;
        if (ch === " ") w *= spaceRatio;
        return w;
      });

      const total = widths.reduce((a, b) => a + b, 0);
      const k = total > 0 ? 360 / total : 0;

      let acc = 0;
      const cts = widths.map((w) => {
        const aw = w * k; // góc “rộng” của ký tự
        const center = acc + aw / 2;
        acc += aw;
        return center;
      });
      setCenters(cts);
    } catch {
      const n = Math.max(chars.length, 1);
      const step = 360 / n;
      setCenters(Array.from({ length: n }, (_, i) => i * step + step / 2));
    }
  };

  // đo ban đầu + khi text/spacing thay đổi
  useLayoutEffect(() => {
    computeCenters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, spacing, spaceRatio]);

  // đo lại khi container resize (font-size thay đổi theo CSS, responsive…)
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(() => computeCenters());
    ro.observe(containerRef.current);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      className={`circular-text ${className}`}
      data-hover={onHover || ""}
      style={{ "--spin-duration": `${spinDuration}s`, "--diameter": `${radius * 2}px` }}
      aria-label={typeof text === "string" ? text : ""}
    >
      <div className="circular-text__spinner" aria-hidden="true">
        {chars.map((ch, i) => {
          const theta = (reverse ? -1 : 1) * centers[i] + startAngle;
          const style = { transform: `rotate(${theta}deg) translate(${radius}px) rotate(90deg)` };
          return (
            <span className="circular-text__char" style={style} key={`${ch}-${i}`}>
              {ch}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default CircularText;
