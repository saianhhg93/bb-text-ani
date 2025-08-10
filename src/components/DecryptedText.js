import { useEffect, useMemo, useRef, useState } from 'react';

/**
 * DecryptedText
 * Props:
 * - text (string)
 * - speed (ms) default 50
 * - maxIterations (number) default 10 (dành cho non-sequential)
 * - sequential (bool) default false
 * - revealDirection: 'start'|'end'|'center' (sequential)
 * - useOriginalCharsOnly (bool) default false
 * - animateOn: 'hover'|'view' default 'hover'
 * - loop (bool) default false (chỉ áp dụng khi animateOn='view')
 * - loopPause (ms) default 1000
 * - className, color
 */
const DEFAULT_CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';

function randomChar(pool) {
  const s = pool || DEFAULT_CHARS;
  return s.charAt(Math.floor(Math.random() * s.length));
}

export default function DecryptedText(props) {
  const {
    text: textProp,
    children,
    speed = 50,
    maxIterations = 10,
    sequential = false,
    revealDirection = 'start',
    useOriginalCharsOnly = false,
    animateOn = 'hover',
    loop = false,
    loopPause = 1000,
    className = '',
    color,
  } = props || {};

  // Fallback text
  const rawText = useMemo(() => {
    if (typeof textProp === 'string' && textProp.length) return textProp;
    if (Array.isArray(textProp)) return textProp.join(' ');
    if (typeof children === 'string' && children.length) return children;
    return '';
  }, [textProp, children]);

  const [display, setDisplay] = useState(rawText);
  const [isRunning, setIsRunning] = useState(false);
  const containerRef = useRef(null);
  const timers = useRef({ id: null, loop: null, obs: null });

  // Build char pool
  const pool = useMemo(() => {
    if (useOriginalCharsOnly && typeof rawText === 'string') {
      const uniq = Array.from(new Set(rawText.split('').filter(Boolean))).join('');
      return uniq || DEFAULT_CHARS;
    }
    return DEFAULT_CHARS;
  }, [rawText, useOriginalCharsOnly]);

  // The animation core
  const runOnce = () => {
    if (!rawText || isRunning) return;
    setIsRunning(true);

    const final = rawText;
    const len = final.length;

    const clearTimer = () => {
      if (timers.current.id) {
        clearInterval(timers.current.id);
        timers.current.id = null;
      }
    };

    if (sequential) {
      let idx = 0;
      const order = (() => {
        switch (revealDirection) {
          case 'end':
            return Array.from({ length: len }, (_, i) => len - 1 - i);
          case 'center': {
            const center = Math.floor(len / 2);
            const arr = [];
            for (let offset = 0; offset < len; offset++) {
              const left = center - offset;
              const right = center + offset + (len % 2 === 0 ? 1 : 0);
              if (left >= 0) arr.push(left);
              if (right < len) arr.push(right);
              if (arr.length >= len) break;
            }
            return arr;
          }
          default: // 'start'
            return Array.from({ length: len }, (_, i) => i);
        }
      })();

      const revealed = new Array(len).fill(false);
      const tick = () => {
        const pos = order[idx++];
        if (pos == null) {
          clearTimer();
          setIsRunning(false);
          if (animateOn === 'view' && loop) {
            timers.current.loop = setTimeout(runOnce, loopPause);
          }
          return;
        }
        revealed[pos] = true;
        // Build string with revealed letters fixed, others scrambled
        let out = '';
        for (let i = 0; i < len; i++) {
          out += revealed[i] ? final[i] : randomChar(pool);
        }
        setDisplay(out);
      };

      timers.current.id = setInterval(tick, Math.max(1, Number(speed)));
    } else {
      // Non-sequential: scramble whole string a few times then show final
      let it = 0;
      const tick = () => {
        it++;
        if (it >= maxIterations) {
          clearTimer();
          setDisplay(final);
          setIsRunning(false);
          if (animateOn === 'view' && loop) {
            timers.current.loop = setTimeout(runOnce, loopPause);
          }
          return;
        }
        let out = '';
        for (let i = 0; i < len; i++) out += randomChar(pool);
        setDisplay(out);
      };
      timers.current.id = setInterval(tick, Math.max(1, Number(speed)));
    }
  };

  // hover mode
  const onMouseEnter = () => {
    if (animateOn === 'hover') {
      if (timers.current.loop) { clearTimeout(timers.current.loop); timers.current.loop = null; }
      runOnce();
    }
  };

  // view mode (IntersectionObserver)
  useEffect(() => {
    if (animateOn !== 'view') return;
    if (!containerRef.current) return;

    const el = containerRef.current;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            if (!isRunning) runOnce();
          }
        });
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    timers.current.obs = obs;

    return () => {
      try { obs.disconnect(); } catch (e) {}
      timers.current.obs = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animateOn, rawText, sequential, revealDirection, speed, maxIterations, loop, loopPause, pool]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timers.current.id) clearInterval(timers.current.id);
      if (timers.current.loop) clearTimeout(timers.current.loop);
      if (timers.current.obs) {
        try { timers.current.obs.disconnect(); } catch (e) {}
      }
    };
  }, []);

  // Khi text đầu vào đổi, reset hiển thị
  useEffect(() => {
    setDisplay(rawText);
  }, [rawText]);

  const style = color ? { color } : undefined;

  return (
    <span
      ref={containerRef}
      className={props.className || ''}
      onMouseEnter={onMouseEnter}
      style={{ display: 'inline-block', whiteSpace: 'pre-wrap', ...style }}
    >
      {/* screen reader giữ nguyên nội dung cuối */}
      <span style={{ position:'absolute', width:1, height:1, padding:0, margin:-1, overflow:'hidden', clip:'rect(0,0,0,0)', whiteSpace:'nowrap', border:0 }}>
        {rawText}
      </span>
      <span aria-hidden="true">{display}</span>
    </span>
  );
}
