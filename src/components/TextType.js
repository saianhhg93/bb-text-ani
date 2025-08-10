"use client";

import { useEffect, useRef, useState, useMemo, createElement } from "@wordpress/element";
import { gsap } from "gsap";
import "./TextType.css";

const clampNumber = (v, lo, hi, def) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return def;
  return Math.min(hi, Math.max(lo, n));
};

const TextType = ({
  text,
  as: Component = "div",
  typingSpeed = 50,            // ms
  initialDelay = 0,            // ms
  pauseDuration = 2000,        // ms
  deletingSpeed = 30,          // ms
  loop = true,                 // ← đã có, giờ hỗ trợ loop cả khi chỉ có 1 câu
  className = "",
  showCursor = true,
  hideCursorWhileTyping = false,
  cursorCharacter = "|",       // "_", "|", "▋", "•", "█"
  cursorClassName = "",
  cursorBlinkDuration = 0.5,   // s
  textColors = [],             // string[]
  textColor,                   // ← mới: màu fallback nếu không dùng textColors
  variableSpeed = false,       // false | {min, max} (ms)
  onSentenceComplete,
  startOnVisible = false,
  reverseMode = false,
  ...props
}) => {
  const textArray = useMemo(() => {
    if (Array.isArray(text)) return text.filter((t) => t != null).map(String);
    if (typeof text === "string" && text.length) return [text];
    return [];
  }, [text]);

  const [displayedText, setDisplayedText] = useState("");
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(!startOnVisible);

  const cursorRef = useRef(null);
  const containerRef = useRef(null);
  const timeoutRef = useRef(null);

  const varSpeedObj = useMemo(() => {
    if (
      variableSpeed &&
      typeof variableSpeed === "object" &&
      Number.isFinite(variableSpeed.min) &&
      Number.isFinite(variableSpeed.max) &&
      variableSpeed.max > variableSpeed.min
    ) {
      return {
        min: clampNumber(variableSpeed.min, 1, 10000, 50),
        max: clampNumber(variableSpeed.max, 1, 10000, 120),
      };
    }
    return null;
  }, [variableSpeed]);

  const getRandomSpeed = () => {
    if (!varSpeedObj) return typingSpeed;
    return Math.random() * (varSpeedObj.max - varSpeedObj.min) + varSpeedObj.min;
  };

  // Màu hiện tại: ưu tiên mảng textColors; nếu không có thì dùng textColor (mới)
  const currentColor =
    Array.isArray(textColors) && textColors.length
      ? textColors[currentTextIndex % textColors.length]
      : textColor;

  useEffect(() => {
    if (!startOnVisible || !containerRef.current) return;
    const el = containerRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setIsVisible(true),
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [startOnVisible]);

  useEffect(() => {
    if (!showCursor || !cursorRef.current) return;
    gsap.set(cursorRef.current, { opacity: 1 });
    const tween = gsap.to(cursorRef.current, {
      opacity: 0,
      duration: cursorBlinkDuration,
      repeat: -1,
      yoyo: true,
      ease: "power2.inOut",
    });
    return () => tween.kill();
  }, [showCursor, cursorBlinkDuration]);

  useEffect(() => {
    if (!isVisible || textArray.length === 0) return;

    const currentTextRaw = textArray[currentTextIndex] ?? "";
    const targetText = reverseMode
      ? currentTextRaw.split("").reverse().join("")
      : currentTextRaw;

    const tick = () => {
      if (isDeleting) {
        if (displayedText === "") {
          setIsDeleting(false);

          onSentenceComplete?.(textArray[currentTextIndex], currentTextIndex);

          // Nếu không loop và đã là câu cuối cùng -> dừng
          if (!loop && currentTextIndex === textArray.length - 1) return;

          // Sang câu tiếp (hoặc vẫn là câu hiện tại nếu chỉ có 1 câu)
          setCurrentTextIndex((prev) =>
            textArray.length > 1 ? (prev + 1) % textArray.length : 0
          );
          setCurrentCharIndex(0);
          timeoutRef.current = setTimeout(() => {}, pauseDuration);
        } else {
          timeoutRef.current = setTimeout(() => {
            setDisplayedText((prev) => prev.slice(0, -1));
          }, clampNumber(deletingSpeed, 1, 2000, 30));
        }
      } else {
        if (currentCharIndex < targetText.length) {
          timeoutRef.current = setTimeout(
            () => {
              setDisplayedText((prev) => prev + targetText[currentCharIndex]);
              setCurrentCharIndex((prev) => prev + 1);
            },
            getRandomSpeed()
          );
        } else if (loop || textArray.length > 1) {
          // ← trước đây chỉ chạy khi >1 câu; giờ nếu loop=true thì 1 câu cũng xóa rồi gõ lại
          timeoutRef.current = setTimeout(() => setIsDeleting(true), pauseDuration);
        }
      }
    };

    if (currentCharIndex === 0 && !isDeleting && displayedText === "") {
      timeoutRef.current = setTimeout(tick, clampNumber(initialDelay, 0, 30000, 0));
    } else {
      tick();
    }

    return () => clearTimeout(timeoutRef.current);
  }, [
    isVisible,
    textArray,
    currentTextIndex,
    currentCharIndex,
    displayedText,
    isDeleting,
    typingSpeed,
    deletingSpeed,
    pauseDuration,
    initialDelay,
    reverseMode,
    varSpeedObj,
    loop,
    onSentenceComplete,
  ]);

  const shouldHideCursor =
    showCursor &&
    hideCursorWhileTyping &&
    (currentCharIndex < (textArray[currentTextIndex] || "").length || isDeleting);

  if (textArray.length === 0) {
    return createElement(Component, { ref: containerRef, className, ...props });
    }

  return createElement(
    Component,
    { ref: containerRef, className: `text-type ${className}`, ...props },
    createElement(
      "span",
      {
        className: "text-type__content",
        ...(currentColor ? { style: { color: currentColor } } : {}),
      },
      displayedText
    ),
    showCursor &&
      createElement(
        "span",
        {
          ref: cursorRef,
          className: `text-type__cursor ${cursorClassName} ${
            shouldHideCursor ? "text-type__cursor--hidden" : ""
          }`,
          "aria-hidden": "true",
        },
        cursorCharacter
      )
  );
};

export default TextType;
