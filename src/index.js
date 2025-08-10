import { createElement, render, createRoot } from '@wordpress/element';
import { registerBlockType } from '@wordpress/blocks';
import Edit from './block/edit';
import './style.scss';

// ==== Components (import MỘT LẦN) ====
import TextType from './components/TextType';
import BlurText from './components/BlurText';
import DecryptedText from './components/DecryptedText';
import ShinyText from './components/ShinyText';
import TrueFocus from './components/TrueFocus';
import CircularText from './components/CircularText';
import FuzzyText from './components/FuzzyText';
import SplitText from './components/SplitText';

// ==== Registry dùng chung ====
const EFFECTS = {
  TextType,
  BlurText,
  DecryptedText,
  ShinyText,
  TrueFocus,
  CircularText,
  FuzzyText,
  SplitText,
};

// Thêm map tên hiệu ứng theo lowercase để tra cứu không phân biệt hoa–thường
const EFFECTS_LC = Object.fromEntries(
  Object.entries(EFFECTS).map(([k, v]) => [k.toLowerCase(), v])
);
// Cho phần Gutenberg Edit (không dùng JSX để an toàn)
export function EffectElement({ type = 'TextType', props = {} }) {
  const Comp = EFFECTS[type] || TextType;
  return createElement(Comp, props);
}

/* ------------------------------------------------------------------
 * BOOTSTRAP FRONTEND
 * - Xuất window.BBTA.render(node, payload) và window.BBTA.mountAll()
 * - Tự động mount .bbta-root khi DOM ready & khi Elementor init
 * ------------------------------------------------------------------ */

// lưu root React để cập nhật thay vì remount
const _roots = new WeakMap();

function bbtaRender(node, payload) {
  try {
    const { type, props } = payload || {};
    // Chuẩn hoá tên type về lowercase khi tra cứu
    const key = (type || 'TextType').toString();
    const Comp =
      EFFECTS[key] ||
      EFFECTS_LC[key.toLowerCase()] || // không phân biệt hoa–thường
      TextType;

    // Lấy fallback text bên trong div.bbta-root
    const inner = (node.textContent || '').trim();

    const canCreateRoot = typeof createRoot === 'function';
    if (canCreateRoot) {
      let root = _roots.get(node);
      if (!root) {
        root = createRoot(node);
        _roots.set(node, root);
      }
      root.render(createElement(Comp, { ...(props || {}) }, inner));
    } else {
      render(createElement(Comp, { ...(props || {}) }, inner), node);
    }
  } catch (err) {
    console.error('BBTA render error:', err);
  }
}



function bbtaMountAll() {
  const nodes = document.querySelectorAll('.bbta-root[data-bbta]');
  nodes.forEach((el) => {
    const raw = el.getAttribute('data-bbta');
    if (!raw) return;
    try {
      const payload = JSON.parse(raw);
      bbtaRender(el, payload);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('BBTA payload parse error:', e);
    }
  });
}

// gắn global & auto mount
if (typeof window !== 'undefined') {
  window.BBTA = window.BBTA || {};
  window.BBTA.render = bbtaRender;
  window.BBTA.mountAll = bbtaMountAll;

  const boot = () => bbtaMountAll();
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(boot, 0);
  } else {
    document.addEventListener('DOMContentLoaded', boot);
  }

  // Elementor frontend / popup
  if (window.jQuery && window.elementorFrontend) {
    jQuery(window).on('elementor/frontend/init', boot);
    jQuery(document).on('elementor/popup/show', boot);
  }
}

/* ------------------------------------------------------------------
 * Gutenberg Block (dynamic save) — vẫn giữ như cũ
 * ------------------------------------------------------------------ */
registerBlockType('bbta/text-ani', {
  title: 'BB Text Ani',
  icon: 'editor-textcolor',
  category: 'widgets',
  attributes: {
    type: { type: 'string', default: 'TextType' },
    text: { type: 'string', default: 'Xin chào Hà Giang' },
    jsonProps: { type: 'string', default: '{}' },
  },
  edit: Edit,
  save: () => null,
});
