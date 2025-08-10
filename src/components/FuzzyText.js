import React, { useEffect, useRef } from "react";

/**
 * FuzzyText (canvas-based, left-aligned)
 * - Nhận nội dung qua `children` (như file usage gốc) hoặc prop `text` (phù hợp builder).
 * - Props:
 *   text?: string
 *   fontSize: number|string = "clamp(2rem, 10vw, 10rem)"
 *   fontWeight: string|number = 900
 *   fontFamily: string = "inherit"
 *   color?: string              // nếu không truyền: lấy từ computed style của canvas
 *   enableHover: boolean = true
 *   baseIntensity: number = 0.18
 *   hoverIntensity: number = 0.5
 *   horizontalMargin: number = 0     // đệm trái/phải chủ động (thường để 0 để canh thẳng)
 *   verticalMargin: number = 0
 */
const FuzzyText = ({
  text,
  children,
  fontSize = "clamp(2rem, 10vw, 10rem)",
  fontWeight = 900,
  fontFamily = "inherit",
  color,
  enableHover = true,
  baseIntensity = 0.18,
  hoverIntensity = 0.5,
  horizontalMargin = 0,   // <-- đổi mặc định 0 để không bị lệch
  verticalMargin = 0,
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    let animationFrameId;
    let isCancelled = false;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const init = async () => {
      try { if (document.fonts?.ready) await document.fonts.ready; } catch {}
      if (isCancelled) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // resolve font
      const resolvedFontFamily =
        fontFamily === "inherit"
          ? window.getComputedStyle(canvas).fontFamily || "sans-serif"
          : fontFamily;

      const fontSizeStr =
        typeof fontSize === "number" ? `${fontSize}px` : String(fontSize);

      // resolve pixel size
      let numericFontSize;
      if (typeof fontSize === "number") {
        numericFontSize = fontSize;
      } else {
        const temp = document.createElement("span");
        temp.style.position = "absolute";
        temp.style.visibility = "hidden";
        temp.style.fontSize = fontSizeStr;
        document.body.appendChild(temp);
        const computedSize = window.getComputedStyle(temp).fontSize;
        numericFontSize = parseFloat(computedSize) || 16;
        temp.remove();
      }

      // nội dung & màu
      const content =
        children !== undefined && children !== null
          ? React.Children.toArray(children).join("")
          : String(text ?? "");

      const effectiveColor =
        color || window.getComputedStyle(canvas).color || "#111";

      // vẽ offscreen
      const offscreen = document.createElement("canvas");
      const offCtx = offscreen.getContext("2d");
      if (!offCtx) return;

      offCtx.font = `${fontWeight} ${fontSizeStr} ${resolvedFontFamily}`;
      offCtx.textBaseline = "alphabetic";

      const metrics = offCtx.measureText(content);
      const actualLeft = metrics.actualBoundingBoxLeft ?? 0;
      const actualRight = metrics.actualBoundingBoxRight ?? metrics.width;
      const actualAscent = metrics.actualBoundingBoxAscent ?? numericFontSize;
      const actualDescent =
        metrics.actualBoundingBoxDescent ?? numericFontSize * 0.2;

      const textBoundingWidth = Math.ceil(actualLeft + actualRight);
      const tightHeight = Math.ceil(actualAscent + actualDescent);

      const extraBuffer = 10; // buffer nhỏ chống “cắt” viền
      offscreen.width = textBoundingWidth + extraBuffer;
      offscreen.height = tightHeight;

      const xOffset = extraBuffer / 2;
      offCtx.font = `${fontWeight} ${fontSizeStr} ${resolvedFontFamily}`;
      offCtx.textBaseline = "alphabetic";
      offCtx.fillStyle = effectiveColor;
      offCtx.clearRect(0, 0, offscreen.width, offscreen.height);
      // đặt left-most pixel ~ x=0 + xOffset
      offCtx.fillText(content, xOffset - actualLeft, actualAscent);

      // ========= Kích thước canvas hiển thị & căn lề =========
      const fuzzRange = 30; // biên độ lệch max theo thiết kế gốc
      const maxIntensity = Math.max(baseIntensity, hoverIntensity);
      // bleed để không bị cắt khi lệch trái/phải
      const bleed = Math.ceil(fuzzRange * maxIntensity);

      const hMargin = horizontalMargin; // bạn có thể tăng nếu muốn có lề chủ động
      const vMargin = verticalMargin;

      // Tăng width để có bleed hai bên, nhưng sẽ bù trừ bằng CSS transform để không lệch trái
      const leftPad = hMargin + bleed;
      const rightPad = hMargin + bleed;

      canvas.width = offscreen.width + leftPad + rightPad;
      canvas.height = offscreen.height + vMargin * 2;

      // vùng tương tác (theo toạ độ canvas)
      const interactiveLeft = leftPad + xOffset;
      const interactiveTop = vMargin;
      const interactiveRight = interactiveLeft + textBoundingWidth;
      const interactiveBottom = interactiveTop + tightHeight;

      let isHovering = false;

      const run = () => {
        if (isCancelled) return;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        // vẽ bắt đầu từ leftPad để chừa bleed bên trái (không cắt)
        ctx.translate(leftPad, vMargin);

        ctx.clearRect(
          -bleed,
          -bleed,
          offscreen.width + 2 * bleed,
          offscreen.height + 2 * bleed
        );

        const intensity = enableHover
          ? (isHovering ? hoverIntensity : baseIntensity)
          : baseIntensity;

        // xé từng scanline horizontal
        for (let j = 0; j < offscreen.height; j++) {
          const dx = Math.floor(intensity * (Math.random() - 0.5) * fuzzRange);
          ctx.drawImage(
            offscreen,
            0, j, offscreen.width, 1,
            dx, j, offscreen.width, 1
          );
        }
        animationFrameId = window.requestAnimationFrame(run);
      };

      run();

      const isInsideTextArea = (x, y) =>
        x >= interactiveLeft && x <= interactiveRight &&
        y >= interactiveTop && y <= interactiveBottom;

      const onMouseMove = (e) => {
        if (!enableHover) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        isHovering = isInsideTextArea(x, y);
      };
      const onMouseLeave = () => { isHovering = false; };
      const onTouchMove = (e) => {
        if (!enableHover) return;
        const rect = canvas.getBoundingClientRect();
        const t = e.touches[0];
        const x = t.clientX - rect.left;
        const y = t.clientY - rect.top;
        isHovering = isInsideTextArea(x, y);
      };
      const onTouchEnd = () => { isHovering = false; };

      if (enableHover) {
        canvas.addEventListener("mousemove", onMouseMove);
        canvas.addEventListener("mouseleave", onMouseLeave);
        canvas.addEventListener("touchmove", onTouchMove, { passive: true });
        canvas.addEventListener("touchend", onTouchEnd);
      }

      canvas.cleanupFuzzyText = () => {
        window.cancelAnimationFrame(animationFrameId);
        if (enableHover) {
          canvas.removeEventListener("mousemove", onMouseMove);
          canvas.removeEventListener("mouseleave", onMouseLeave);
          canvas.removeEventListener("touchmove", onTouchMove);
          canvas.removeEventListener("touchend", onTouchEnd);
        }
      };
    };

    init();

    return () => {
      isCancelled = true;
      window.cancelAnimationFrame(animationFrameId);
      const c = canvasRef.current;
      if (c && c.cleanupFuzzyText) c.cleanupFuzzyText();
    };
  }, [
    text,
    children,
    fontSize,
    fontWeight,
    fontFamily,
    color,
    enableHover,
    baseIntensity,
    hoverIntensity,
    horizontalMargin,
    verticalMargin,
  ]);

  // Tính bleed ở ngoài để bù trừ bằng CSS transform (canh thẳng mép trái)
  const bleed = Math.ceil(30 * Math.max(baseIntensity, hoverIntensity));

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: "inline-block",
        verticalAlign: "baseline",
        // bù đệm bên trái để mép trái của chữ thẳng với text bình thường
        transform: `translateX(-${bleed}px)`,
      }}
    />
  );
};

export default FuzzyText;
