import { createElement, Fragment, useMemo, useEffect, useRef } from '@wordpress/element';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import {
  PanelBody,
  SelectControl,
  TextareaControl,
  ToggleControl,
  RangeControl,
  ColorPalette,
  TextControl,
  Notice,
  Button,
} from '@wordpress/components';
import { EffectElement } from '../index';

const EFFECT_OPTIONS = [
  { label: 'TextType', value: 'TextType' },
  { label: 'BlurText', value: 'BlurText' },
  { label: 'DecryptedText', value: 'DecryptedText' },
  { label: 'ShinyText', value: 'ShinyText' },
  { label: 'TrueFocus', value: 'TrueFocus' },
  { label: 'CircularText', value: 'CircularText' },
  { label: 'FuzzyText', value: 'FuzzyText' },
  { label: 'SplitText', value: 'SplitText' },
];

const SUGGEST_COLORS = [
  { name: 'Green', color: '#22c55e' },
  { name: 'Blue', color: '#3b82f6' },
  { name: 'Yellow', color: '#eab308' },
  { name: 'Red', color: '#ef4444' },
  { name: 'White', color: '#ffffff' },
  { name: 'Black', color: '#111111' },
];

export default function Edit({ attributes, setAttributes }) {
  const { type, text, jsonProps } = attributes;

  // Parse props JSON safely
  const propsObj = useMemo(() => {
    try {
      const p = JSON.parse(jsonProps || '{}');
      return typeof p === 'object' && p ? p : {};
    } catch {
      return {};
    }
  }, [jsonProps]);

  // Parse text (string or JSON array allowed)
  let parsedText = text;
  try {
    const t = JSON.parse(text);
    parsedText = t;
  } catch {}

  // Preview payload
  const previewProps = useMemo(
    () => ({ type, props: { text: parsedText, ...propsObj } }),
    [type, parsedText, propsObj]
  );

  const blockProps = useBlockProps({ className: 'bbta-editor-preview' });

  // Helpers to update nested props object
  const writeProps = (nextObj) => setAttributes({ jsonProps: JSON.stringify(nextObj) });
  const setP = (k, v) => writeProps({ ...propsObj, [k]: v });

  // ===== Defaults for each effect =====
  // Shiny
  const st = { speed: propsObj.speed ?? 5, disabled: !!propsObj.disabled, textColor: propsObj.textColor ?? '' };

  // Circular
  const ct = {
    onHover: propsObj.onHover ?? '',
    spinDuration: propsObj.spinDuration ?? 20,
    spacing: propsObj.spacing ?? 'proportional',
    spaceRatio: propsObj.spaceRatio ?? 0.6,
    startAngle: propsObj.startAngle ?? -90,
    reverse: !!propsObj.reverse,
    radius: propsObj.radius ?? 80,
  };

  // Fuzzy
  const fz = {
    fontSize: propsObj.fontSize ?? '',
    fontWeight: propsObj.fontWeight ?? '',
    fontFamily: propsObj.fontFamily ?? 'inherit',
    color: propsObj.color ?? '',
    enableHover: propsObj.enableHover ?? true,
    baseIntensity: propsObj.baseIntensity ?? 0.18,
    hoverIntensity: propsObj.hoverIntensity ?? 0.5,
  };

  // Split
  const sp = {
    splitType: propsObj.splitType ?? 'chars',
    ease: propsObj.ease ?? 'power3.out',
    delay: propsObj.delay ?? 100,
    duration: propsObj.duration ?? 0.6,
    threshold: propsObj.threshold ?? 0.1,
    rootMargin: propsObj.rootMargin ?? '-100px',
    textAlign: propsObj.textAlign ?? 'center',
    fromJSON: JSON.stringify(propsObj.from ?? { opacity: 0, y: 40 }),
    toJSON: JSON.stringify(propsObj.to ?? { opacity: 1, y: 0 }),
    showCompletionToast: !!propsObj.showCompletionToast,
    loop: !!propsObj.loop,
    loopDelay: propsObj.loopDelay ?? 0,
    yoyo: !!propsObj.yoyo,
    color: propsObj.color ?? '',
  };

  // TextType
  const tt = {
    typingSpeed: propsObj.typingSpeed ?? 50,
    initialDelay: propsObj.initialDelay ?? 0,
    pauseDuration: propsObj.pauseDuration ?? 2000,
    deletingSpeed: propsObj.deletingSpeed ?? 30,
    loop: propsObj.loop ?? true,
    showCursor: propsObj.showCursor ?? true,
    hideCursorWhileTyping: propsObj.hideCursorWhileTyping ?? false,
    cursorCharacter: propsObj.cursorCharacter ?? '|',
    cursorBlinkDuration: propsObj.cursorBlinkDuration ?? 0.5,
    reverseMode: propsObj.reverseMode ?? false,
    startOnVisible: propsObj.startOnVisible ?? false,
    textColor: propsObj.textColor ?? '',
  };

  // Blur
  const bl = {
    animateBy: propsObj.animateBy ?? 'words',
    direction: propsObj.direction ?? 'top',
    delay: propsObj.delay ?? 200,
    stepDuration: propsObj.stepDuration ?? 0.35,
    threshold: propsObj.threshold ?? 0.1,
    rootMargin: propsObj.rootMargin ?? '0px',
    loop: !!propsObj.loop,
    loopDelay: propsObj.loopDelay ?? 0.3,
    yoyo: propsObj.yoyo ?? true,
    color: propsObj.color ?? '',
  };

  // Decrypted
  const dc = {
    speed: propsObj.speed ?? 50,
    maxIterations: propsObj.maxIterations ?? 10,
    sequential: !!propsObj.sequential,
    revealDirection: propsObj.revealDirection ?? 'start',
    useOriginalCharsOnly: !!propsObj.useOriginalCharsOnly,
    animateOn: propsObj.animateOn ?? 'hover',
    color: propsObj.color ?? '',
    loop: !!propsObj.loop,
    loopPause: propsObj.loopPause ?? 1000,
  };

  // TrueFocus
  const tf = {
    borderColor: propsObj.borderColor ?? '#22c55e',
    glowColor: propsObj.glowColor ?? 'rgba(34,197,94,.6)',
    blurAmount: propsObj.blurAmount ?? 5,
    animationDuration: propsObj.animationDuration ?? 0.5,
    pauseBetweenAnimations: propsObj.pauseBetweenAnimations ?? 1,
    manualMode: !!propsObj.manualMode,
  };

  // ===== Shortcode preview (auto updates) =====
  const shortcode = useMemo(() => {
    const finalProps = { ...propsObj };
    if (typeof finalProps.text !== 'undefined') delete finalProps.text;
    let json = '{}';
    try { json = JSON.stringify(finalProps); } catch {}
    json = json.replace(/'/g, '&#39;');
    const escText = String(text ?? '').replace(/"/g, '&quot;');
    return `[bbta type="${type}" text="${escText}" props='${json}']`;
  }, [type, text, propsObj]);

  const copyRef = useRef(null);
  const handleCopy = () => {
    if (!shortcode) return;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(shortcode);
    } else if (copyRef.current) {
      copyRef.current.select();
      document.execCommand('copy');
    }
  };

  return createElement(
    Fragment,
    null,
    createElement(
      InspectorControls,
      null,
      // ===== General =====
      createElement(
        PanelBody,
        { title: 'Cấu hình chung' },
        createElement(SelectControl, {
          label: 'Hiệu ứng',
          value: type,
          options: EFFECT_OPTIONS,
          onChange: (v) => setAttributes({ type: v }),
        }),
        createElement(TextareaControl, {
          label: 'Text hoặc JSON Array',
          help: 'Ví dụ: "Xin chào" hoặc ["Xin chào","Hà Giang"]',
          value: text,
          onChange: (v) => setAttributes({ text: v }),
        }),
        createElement(TextareaControl, {
          label: 'Props (JSON) — nâng cao',
          help: 'Bạn có thể ghi đè props ở đây. UI bên dưới sẽ tự đồng bộ.',
          value: jsonProps,
          onChange: (v) => setAttributes({ jsonProps: v }),
        }),
      ),

      // ===== Shortcode Preview (new) =====
      createElement(
        PanelBody,
        { title: 'Shortcode • Preview', initialOpen: true },
        createElement(TextareaControl, {
          label: 'Dán vào nơi cần dùng:',
          value: shortcode,
          rows: 3,
          onChange: () => {},
          ref: copyRef,
          readOnly: true,
        }),
        createElement(Button, { variant: 'secondary', onClick: handleCopy }, 'Copy shortcode')
      ),

      // ===== TextType =====
      type === 'TextType' &&
        createElement(
          PanelBody,
          { title: 'TextType • Customize', initialOpen: true },
          createElement(RangeControl, {
            label: 'Typing Speed (ms)',
            value: tt.typingSpeed,
            onChange: (v) => setP('typingSpeed', v),
            min: 1,
            max: 500,
            step: 1,
          }),
          createElement(RangeControl, {
            label: 'Pause Duration (ms)',
            value: tt.pauseDuration,
            onChange: (v) => setP('pauseDuration', v),
            min: 0,
            max: 10000,
            step: 50,
          }),
          createElement(RangeControl, {
            label: 'Deleting Speed (ms)',
            value: tt.deletingSpeed,
            onChange: (v) => setP('deletingSpeed', v),
            min: 1,
            max: 500,
            step: 1,
          }),
          createElement(ToggleControl, {
            label: 'Loop',
            checked: !!tt.loop,
            onChange: (v) => setP('loop', v),
          }),
          createElement(ToggleControl, {
            label: 'Show Cursor',
            checked: !!tt.showCursor,
            onChange: (v) => setP('showCursor', v),
          }),
          createElement(ToggleControl, {
            label: 'Hide Cursor While Typing',
            checked: !!tt.hideCursorWhileTyping,
            onChange: (v) => setP('hideCursorWhileTyping', v),
          }),
          createElement(TextControl, {
            label: 'Cursor Character',
            value: tt.cursorCharacter,
            onChange: (v) => setP('cursorCharacter', v),
          }),
          createElement(RangeControl, {
            label: 'Cursor Blink Duration (s)',
            value: tt.cursorBlinkDuration,
            min: 0.1,
            max: 2,
            step: 0.1,
            onChange: (v) => setP('cursorBlinkDuration', v),
          }),
          createElement(ToggleControl, {
            label: 'Reverse Mode',
            checked: !!tt.reverseMode,
            onChange: (v) => setP('reverseMode', v),
          }),
          createElement(ToggleControl, {
            label: 'Start On Visible',
            checked: !!tt.startOnVisible,
            onChange: (v) => setP('startOnVisible', v),
          }),
          createElement('p', null, 'Text Color'),
          createElement(ColorPalette, {
            colors: SUGGEST_COLORS,
            value: tt.textColor || undefined,
            onChange: (c) => {
              const next = { ...propsObj };
              if (c) next.textColor = c;
              else delete next.textColor;
              writeProps(next);
            },
          })
        ),

      // ===== Blur =====
      type === 'BlurText' &&
        createElement(
          PanelBody,
          { title: 'Blur • Customize', initialOpen: true },
          createElement(SelectControl, {
            label: 'Animate By',
            value: bl.animateBy,
            options: [
              { label: 'words', value: 'words' },
              { label: 'letters', value: 'letters' },
            ],
            onChange: (v) => setP('animateBy', v),
          }),
          createElement(SelectControl, {
            label: 'Direction',
            value: bl.direction,
            options: [
              { label: 'top', value: 'top' },
              { label: 'bottom', value: 'bottom' },
            ],
            onChange: (v) => setP('direction', v),
          }),
          createElement(RangeControl, {
            label: 'Stagger Delay (ms)',
            value: bl.delay,
            min: 0,
            max: 1000,
            step: 5,
            onChange: (v) => setP('delay', v),
          }),
          createElement(RangeControl, {
            label: 'Step Duration (s)',
            value: bl.stepDuration,
            min: 0.05,
            max: 2,
            step: 0.05,
            onChange: (v) => setP('stepDuration', v),
          }),
          createElement(RangeControl, {
            label: 'Threshold',
            value: bl.threshold,
            min: 0,
            max: 1,
            step: 0.01,
            onChange: (v) => setP('threshold', v),
          }),
          createElement(TextControl, {
            label: 'Root Margin',
            value: bl.rootMargin,
            onChange: (v) => setP('rootMargin', v),
          }),
          createElement(ToggleControl, {
            label: 'Loop',
            checked: !!bl.loop,
            onChange: (v) => setP('loop', v),
          }),
          createElement(RangeControl, {
            label: 'Loop Delay (s)',
            value: bl.loopDelay,
            min: 0,
            max: 3,
            step: 0.1,
            onChange: (v) => setP('loopDelay', v),
          }),
          createElement(ToggleControl, {
            label: 'Yoyo',
            checked: !!bl.yoyo,
            onChange: (v) => setP('yoyo', v),
          }),
          createElement('p', null, 'Text Color'),
          createElement(ColorPalette, {
            colors: SUGGEST_COLORS,
            value: bl.color || undefined,
            onChange: (c) => {
              const next = { ...propsObj };
              if (c) next.color = c;
              else delete next.color;
              writeProps(next);
            },
          })
        ),

      // ===== Decrypted =====
      type === 'DecryptedText' &&
        createElement(
          PanelBody,
          { title: 'Decrypted • Customize', initialOpen: true },
          createElement(RangeControl, {
            label: 'Speed (ms)',
            value: dc.speed,
            min: 10,
            max: 200,
            step: 1,
            onChange: (v) => setP('speed', v),
          }),
          createElement(RangeControl, {
            label: 'Max Iterations',
            value: dc.maxIterations,
            min: 1,
            max: 50,
            step: 1,
            onChange: (v) => setP('maxIterations', v),
          }),
          createElement(ToggleControl, {
            label: 'Sequential',
            checked: !!dc.sequential,
            onChange: (v) => setP('sequential', v),
          }),
          createElement(SelectControl, {
            label: 'Reveal Direction',
            value: dc.revealDirection,
            options: [
              { label: 'start', value: 'start' },
              { label: 'end', value: 'end' },
              { label: 'center', value: 'center' },
            ],
            onChange: (v) => setP('revealDirection', v),
          }),
          createElement(ToggleControl, {
            label: 'Original Chars Only',
            checked: !!dc.useOriginalCharsOnly,
            onChange: (v) => setP('useOriginalCharsOnly', v),
          }),
          createElement(SelectControl, {
            label: 'Animate On',
            value: dc.animateOn,
            options: [
              { label: 'hover', value: 'hover' },
              { label: 'view', value: 'view' },
            ],
            onChange: (v) => setP('animateOn', v),
          }),
          createElement(ToggleControl, {
            label: 'Loop (chỉ khi animateOn = view)',
            checked: !!dc.loop,
            onChange: (v) => setP('loop', v),
          }),
          createElement(RangeControl, {
            label: 'Loop Pause (ms)',
            value: dc.loopPause,
            min: 100,
            max: 5000,
            step: 50,
            onChange: (v) => setP('loopPause', v),
          }),
          createElement('p', null, 'Text Color'),
          createElement(ColorPalette, {
            colors: SUGGEST_COLORS,
            value: dc.color || undefined,
            onChange: (c) => {
              const next = { ...propsObj };
              if (c) next.color = c;
              else delete next.color;
              writeProps(next);
            },
          })
        ),

      // ===== Shiny =====
      type === 'ShinyText' &&
        createElement(
          PanelBody,
          { title: 'Shiny • Customize', initialOpen: true },
          createElement(RangeControl, {
            label: 'Animation Duration (s)',
            value: st.speed,
            onChange: (v) => setP('speed', v),
            min: 1,
            max: 60,
            step: 0.5,
          }),
          createElement(ToggleControl, {
            label: 'Disabled',
            checked: st.disabled,
            onChange: (v) => setP('disabled', v),
          }),
          createElement('p', null, 'Text Color'),
          createElement(ColorPalette, {
            colors: SUGGEST_COLORS,
            value: st.textColor || undefined,
            onChange: (c) => {
              const next = { ...propsObj };
              if (c) next.textColor = c;
              else delete next.textColor;
              writeProps(next);
            },
          })
        ),

      // ===== TrueFocus =====
      type === 'TrueFocus' &&
        createElement(
          PanelBody,
          { title: 'True Focus • Customize', initialOpen: true },
          createElement('p', null, 'Border Color'),
          createElement(ColorPalette, {
            colors: SUGGEST_COLORS,
            value: tf.borderColor || undefined,
            onChange: (c) => setP('borderColor', c),
          }),
          createElement(ToggleControl, {
            label: 'Hover Mode (Manual)',
            checked: !!tf.manualMode,
            onChange: (v) => setP('manualMode', v),
          }),
          createElement(RangeControl, {
            label: 'Blur Amount',
            value: tf.blurAmount,
            onChange: (v) => setP('blurAmount', v),
            min: 0,
            max: 10,
            step: 0.1,
          }),
          createElement(RangeControl, {
            label: 'Animation Duration (s)',
            value: tf.animationDuration,
            onChange: (v) => setP('animationDuration', v),
            min: 0.1,
            max: 2,
            step: 0.1,
          }),
          createElement(RangeControl, {
            label: 'Pause Between Animations (s)',
            value: tf.pauseBetweenAnimations,
            onChange: (v) => setP('pauseBetweenAnimations', v),
            min: 0.1,
            max: 5,
            step: 0.1,
          }),
          createElement('p', null, 'Glow Color'),
          createElement(ColorPalette, {
            colors: SUGGEST_COLORS,
            value: tf.glowColor || undefined,
            onChange: (c) => setP('glowColor', c),
          }),
          createElement(Notice, { status: 'info', isDismissible: false }, 'Bạn có thể ghi màu ở ô JSON nếu cần dạng rgba().')
        ),

      // ===== Circular =====
      type === 'CircularText' &&
        createElement(
          PanelBody,
          { title: 'Circular • Customize', initialOpen: true },
          createElement(SelectControl, {
            label: 'On Hover',
            value: ct.onHover,
            options: [
              { label: 'None', value: '' },
              { label: 'Slow Down', value: 'slowDown' },
              { label: 'Speed Up', value: 'speedUp' },
              { label: 'Pause', value: 'pause' },
              { label: 'Go Bonkers', value: 'goBonkers' },
            ],
            onChange: (v) => setP('onHover', v),
          }),
          createElement(RangeControl, {
            label: 'Spin Duration (s)',
            value: ct.spinDuration,
            onChange: (v) => setP('spinDuration', v),
            min: 2,
            max: 60,
            step: 1,
          }),
          createElement(SelectControl, {
            label: 'Spacing',
            value: ct.spacing,
            options: [
              { label: 'Proportional (đẹp hơn)', value: 'proportional' },
              { label: 'Equal (đều ký tự)', value: 'equal' },
            ],
            onChange: (v) => setP('spacing', v),
          }),
          ct.spacing === 'proportional' &&
            createElement(RangeControl, {
              label: 'Space Ratio',
              value: ct.spaceRatio,
              onChange: (v) => setP('spaceRatio', v),
              min: 0.2,
              max: 1.5,
              step: 0.05,
            }),
          createElement(RangeControl, {
            label: 'Start Angle (deg)',
            value: ct.startAngle,
            onChange: (v) => setP('startAngle', v),
            min: -180,
            max: 180,
            step: 1,
          }),
          createElement(ToggleControl, {
            label: 'Reverse (đảo chiều chữ quanh tâm)',
            checked: !!ct.reverse,
            onChange: (v) => setP('reverse', v),
          }),
          createElement(RangeControl, {
            label: 'Radius (px)',
            value: ct.radius,
            onChange: (v) => setP('radius', v),
            min: 40,
            max: 240,
            step: 2,
          }),
          createElement(Notice, { status: 'info', isDismissible: false }, 'Nếu khoảng cách chưa đều: Spacing = Proportional và giảm Space Ratio (~0.45–0.65).')
        ),

      // ===== Fuzzy =====
      type === 'FuzzyText' &&
        createElement(
          PanelBody,
          { title: 'Fuzzy • Customize', initialOpen: true },
          createElement(RangeControl, {
            label: 'Base Intensity',
            value: fz.baseIntensity,
            onChange: (v) => setP('baseIntensity', v),
            min: 0,
            max: 1,
            step: 0.01,
          }),
          createElement(RangeControl, {
            label: 'Hover Intensity',
            value: fz.hoverIntensity,
            onChange: (v) => setP('hoverIntensity', v),
            min: 0,
            max: 1,
            step: 0.01,
          }),
          createElement(ToggleControl, {
            label: 'Enable Hover',
            checked: !!fz.enableHover,
            onChange: (v) => setP('enableHover', v),
          }),
          createElement(TextControl, {
            label: 'Font Size (CSS or px)',
            help: 'Ví dụ: 64, 48px, clamp(2rem,8vw,8rem)',
            value: fz.fontSize,
            onChange: (v) => setP('fontSize', v),
          }),
          createElement(TextControl, {
            label: 'Font Weight',
            help: 'Ví dụ: 900, bold',
            value: fz.fontWeight,
            onChange: (v) => setP('fontWeight', v),
          }),
          createElement(TextControl, {
            label: 'Font Family',
            value: fz.fontFamily,
            onChange: (v) => setP('fontFamily', v),
          }),
          createElement('p', null, 'Text Color'),
          createElement(ColorPalette, {
            colors: SUGGEST_COLORS,
            value: fz.color || undefined,
            onChange: (c) => {
              const next = { ...propsObj };
              if (c) next.color = c;
              else delete next.color;
              writeProps(next);
            },
          })
        ),

      // ===== Split =====
      type === 'SplitText' &&
        createElement(
          PanelBody,
          { title: 'Split • Customize', initialOpen: true },
          createElement(SelectControl, {
            label: 'Split Type',
            value: sp.splitType,
            options: [
              { label: 'chars', value: 'chars' },
              { label: 'words', value: 'words' },
              { label: 'lines', value: 'lines' },
            ],
            onChange: (v) => setP('splitType', v),
          }),
          createElement(TextControl, {
            label: 'Ease',
            help: 'VD: power3.out, elastic.out(1, 0.3)',
            value: sp.ease,
            onChange: (v) => setP('ease', v),
          }),
          createElement(ToggleControl, {
            label: 'Show Completion Toast',
            checked: !!sp.showCompletionToast,
            onChange: (v) => setP('showCompletionToast', v),
          }),
          createElement(ToggleControl, {
            label: 'Loop',
            checked: !!sp.loop,
            onChange: (v) => setP('loop', v),
          }),
          createElement(ToggleControl, {
            label: 'Yoyo',
            checked: !!sp.yoyo,
            onChange: (v) => setP('yoyo', v),
          }),
          createElement(RangeControl, {
            label: 'Loop Delay (s)',
            value: sp.loopDelay,
            onChange: (v) => setP('loopDelay', v),
            min: 0,
            max: 3,
            step: 0.1,
          }),
          createElement(RangeControl, {
            label: 'Stagger Delay (ms)',
            value: sp.delay,
            onChange: (v) => setP('delay', v),
            min: 0,
            max: 1000,
            step: 5,
          }),
          createElement(RangeControl, {
            label: 'Duration (s)',
            value: sp.duration,
            onChange: (v) => setP('duration', v),
            min: 0.1,
            max: 5,
            step: 0.1,
          }),
          createElement(RangeControl, {
            label: 'Threshold',
            value: sp.threshold,
            onChange: (v) => setP('threshold', v),
            min: 0,
            max: 1,
            step: 0.01,
          }),
          createElement(TextControl, {
            label: 'Root Margin',
            value: sp.rootMargin,
            onChange: (v) => setP('rootMargin', v),
          }),
          createElement(SelectControl, {
            label: 'Text Align',
            value: sp.textAlign,
            options: [
              { label: 'left', value: 'left' },
              { label: 'center', value: 'center' },
              { label: 'right', value: 'right' },
              { label: 'start', value: 'start' },
              { label: 'end', value: 'end' },
            ],
            onChange: (v) => setP('textAlign', v),
          }),
          createElement(TextareaControl, {
            label: 'From (JSON)',
            help: 'VD: {"opacity":0,"y":40}',
            value: sp.fromJSON,
            onChange: (v) => {
              let parsed = { opacity: 0, y: 40 };
              try { parsed = JSON.parse(v); } catch {}
              setP('from', parsed);
              setP('fromJSON', v);
            },
          }),
          createElement(TextareaControl, {
            label: 'To (JSON)',
            help: 'VD: {"opacity":1,"y":0}',
            value: sp.toJSON,
            onChange: (v) => {
              let parsed = { opacity: 1, y: 0 };
              try { parsed = JSON.parse(v); } catch {}
              setP('to', parsed);
              setP('toJSON', v);
            },
          }),
          createElement('p', null, 'Text Color'),
          createElement(ColorPalette, {
            colors: SUGGEST_COLORS,
            value: sp.color || undefined,
            onChange: (c) => {
              const next = { ...propsObj };
              if (c) next.color = c;
              else delete next.color;
              writeProps(next);
            },
          })
        )
    ),
    createElement('div', blockProps, createElement(EffectElement, previewProps))
  );
}
