import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  createElement,
} from "@wordpress/element";
import { motion } from "framer-motion";

// TrueFocus: mặc định hiển thị 4 góc (cornersOnly = true)
const TrueFocus = ({
  text,
  sentence = "True Focus",
  manualMode = false,           // = Hover mode
  blurAmount = 5,
  borderColor = "green",
  glowColor = "rgba(0, 255, 0, 0.6)",
  animationDuration = 0.5,
  pauseBetweenAnimations = 1,
  className = "",

  // --- mới: tùy chọn góc ---
  cornersOnly = true,           // true = chỉ 4 góc; false = có thêm outline khung
  cornerSize = 12,              // px: kích thước mỗi góc
  cornerThickness = 3,          // px: độ dày nét góc
  cornerOffset = 6,             // px: khoảng đẩy góc ra ngoài khung
  cornerRadius = 3,             // px: bo góc cho “góc”
}) => {
  // Ưu tiên 'text' người dùng nhập
  const resolvedSentence = useMemo(() => {
    if (text !== undefined && text !== null) {
      if (Array.isArray(text)) return text.join(" ");
      return String(text);
    }
    return sentence;
  }, [text, sentence]);

  const words = useMemo(
    () => (resolvedSentence ? String(resolvedSentence).trim().split(/\s+/) : []),
    [resolvedSentence]
  );

  const [currentIndex, setCurrentIndex] = useState(words.length ? 0 : -1);
  const containerRef = useRef(null);
  const wordRefs = useRef([]);
  const [focusRect, setFocusRect] = useState({ x: 0, y: 0, width: 1, height: 1 });
  const intervalRef = useRef(null);

  const measure = () => {
    const container = containerRef.current;
    const el = wordRefs.current[currentIndex];
    if (!container || !el || currentIndex < 0) return;

    const pr = container.getBoundingClientRect();
    const ar = el.getBoundingClientRect();
    setFocusRect({
      x: ar.left - pr.left,
      y: ar.top - pr.top,
      width: Math.max(1, ar.width),
      height: Math.max(1, ar.height),
    });
  };

  useLayoutEffect(() => {
    const id = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(id);
  }, [currentIndex, words.length]);

  useEffect(() => {
    let ro;
    if (containerRef.current && "ResizeObserver" in window) {
      ro = new ResizeObserver(measure);
      ro.observe(containerRef.current);
    }
    if (document.fonts?.ready) {
      document.fonts.ready.then(measure);
    }
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("resize", measure);
      if (ro) ro.disconnect();
    };
  }, []);

  useEffect(() => {
    setCurrentIndex(words.length ? 0 : -1);
    clearInterval(intervalRef.current);

    if (!manualMode && words.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((p) => (p + 1) % words.length);
      }, (animationDuration + pauseBetweenAnimations) * 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [words.length, manualMode, animationDuration, pauseBetweenAnimations]);

  const handleMouseEnter = (i) => {
    if (manualMode) setCurrentIndex(i);
  };

  // Styles (inline để không phụ thuộc CSS ngoài)
  const containerStyle = {
    position: "relative",
    display: "inline-flex",
    gap: "0.5em",
    alignItems: "baseline",
    flexWrap: "wrap",
    isolation: "isolate",
  };

  const wordStyleBase = {
    position: "relative",
    fontWeight: 900,
    transition: `filter ${animationDuration}s ease, color ${animationDuration}s ease`,
    zIndex: 1,
  };

  const frameStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    pointerEvents: "none",
    boxSizing: "content-box",
    zIndex: 999,
    willChange: "transform,width,height",
    ...(cornersOnly
      ? {}
      : {
          // nếu cần khung vuông đầy đủ
          outline: `2px solid ${borderColor}`,
          outlineOffset: cornerOffset,
          borderRadius: 4,
        }),
  };

  const cornerBase = {
    position: "absolute",
    width: cornerSize,
    height: cornerSize,
    border: `${cornerThickness}px solid ${borderColor}`,
    filter: `drop-shadow(0 0 6px ${glowColor})`,
    borderRadius: cornerRadius,
  };
  const cornerTL = {
    ...cornerBase,
    top: -cornerOffset,
    left: -cornerOffset,
    borderRight: "none",
    borderBottom: "none",
  };
  const cornerTR = {
    ...cornerBase,
    top: -cornerOffset,
    right: -cornerOffset,
    borderLeft: "none",
    borderBottom: "none",
  };
  const cornerBL = {
    ...cornerBase,
    bottom: -cornerOffset,
    left: -cornerOffset,
    borderRight: "none",
    borderTop: "none",
  };
  const cornerBR = {
    ...cornerBase,
    bottom: -cornerOffset,
    right: -cornerOffset,
    borderLeft: "none",
    borderTop: "none",
  };

  return createElement(
    "div",
    { className: `focus-container ${className}`, ref: containerRef, style: containerStyle },
    words.map((word, i) =>
      createElement(
        "span",
        {
          key: i,
          ref: (el) => (wordRefs.current[i] = el),
          className: `focus-word ${manualMode ? "manual" : ""} ${
            i === currentIndex && !manualMode ? "active" : ""
          }`,
          style: {
            ...wordStyleBase,
            filter: i === currentIndex ? "blur(0px)" : `blur(${blurAmount}px)`,
          },
          onMouseEnter: () => handleMouseEnter(i),
        },
        word
      )
    ),
    createElement(
      motion.div,
      {
        className: "focus-frame",
        initial: false,
        animate: {
          x: focusRect.x,
          y: focusRect.y,
          width: focusRect.width,
          height: focusRect.height,
          opacity: currentIndex >= 0 ? 1 : 0,
        },
        transition: { duration: animationDuration },
        style: frameStyle,
      },
      // chỉ render 4 góc (không viền)
      createElement("span", { style: cornerTL }),
      createElement("span", { style: cornerTR }),
      createElement("span", { style: cornerBL }),
      createElement("span", { style: cornerBR })
    )
  );
};

export default TrueFocus;
