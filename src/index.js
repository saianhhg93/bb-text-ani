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
 * BOOTSTRAP LOGIC
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
  const nodes = document.querySelectorAll('.bbta-root[data-bbta]:not([data-bbta-inited])');
  nodes.forEach((el) => {
    el.setAttribute('data-bbta-inited', 'true');
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

  // Logic khởi chạy chính
  const boot = () => {
    // Không chạy mountAll trong Elementor editor, vì sẽ có logic riêng
    if (window.elementorFrontend?.isEditMode()) {
        return;
    }
    bbtaMountAll();
  };

  // Chạy khi trang tải xong
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(boot, 0);
  } else {
    document.addEventListener('DOMContentLoaded', boot);
  }
  
  // Tích hợp Elementor
  if (window.jQuery) {
    jQuery(window).on('elementor/frontend/init', () => {
        // Chạy cho frontend
        elementorFrontend.hooks.addAction('frontend/element_ready/bbta_text_ani.default', ($scope) => {
            bbtaMountAll();
        });

        // **LOGIC ĐẶC BIỆT CHO EDITOR PREVIEW**
        if (elementorFrontend.isEditMode()) {
            const observer = new MutationObserver(() => {
                // Mỗi khi có thay đổi trong DOM của trình dựng, quét lại
                bbtaMountAll();
            });
            // Theo dõi toàn bộ body của trang preview
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    });
  }
}

/* ------------------------------------------------------------------
 * Gutenberg Block (dynamic save)
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