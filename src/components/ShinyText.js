import { useEffect } from "@wordpress/element";

// CSS shiny (fallback ::after + bản webkit background-clip). KHÔNG đụng tới color:
// - WebKit: dùng -webkit-text-fill-color: transparent (không set color: transparent)
// - Browser khác: dùng ::after overlay
const SHINY_CSS = `
.bbta-shiny, .shiny-text { position: relative; display: inline-block; color: inherit; vertical-align: baseline; }
.bbta-shiny::after, .shiny-text::after {
  content: "";
  position: absolute;
  inset: -0.05em 0;
  pointer-events: none;
  background: linear-gradient(120deg,
    rgba(0,0,0,0) 40%,
    var(--shiny-highlight, rgba(255,255,255,0.95)) 50%,
    rgba(0,0,0,0) 60%);
  background-size: 200% 100%;
  background-position: 100% 0;
  animation: bbta-shiny-sweep var(--shiny-duration, 5s) linear infinite;
  border-radius: .1em;
  mix-blend-mode: plus-lighter;
  z-index: 1;
}
@keyframes bbta-shiny-sweep { to { background-position: -100% 0; } }

/* Bản đẹp nhất cho WebKit (Chrome/Safari/Edge): clip gradient vào chữ */
@supports (-webkit-background-clip: text) {
  .bbta-shiny, .shiny-text {
    background-image:
      linear-gradient(120deg,
        rgba(255,255,255,0) 40%,
        var(--shiny-highlight, rgba(255,255,255,0.95)) 50%,
        rgba(255,255,255,0) 60%),
      linear-gradient(currentColor, currentColor); /* base = currentColor */
    background-size: 200% 100%, 100% 100%;
    background-position: 100% 0, 0 0;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent; /* chỉ fill transparent, giữ color để currentColor vẫn đúng */
    animation: bbta-shiny-sweep var(--shiny-duration, 5s) linear infinite;
  }
  .bbta-shiny::after, .shiny-text::after { content: none; } /* tắt fallback */
}

/* Dừng animation khi disabled */
.bbta-shiny.disabled, .shiny-text.disabled { animation: none; }
.bbta-shiny.disabled::after, .shiny-text.disabled::after { animation: none; }
`;

function ensureStyleTag() {
  if (typeof document === "undefined") return;
  if (document.getElementById("bbta-shiny-style")) return;
  const style = document.createElement("style");
  style.id = "bbta-shiny-style";
  style.textContent = SHINY_CSS;
  document.head.appendChild(style);
}

const ShinyText = ({
  text,
  disabled = false,
  speed = 5, // giây
  highlight = "rgba(255,255,255,0.95)",
  textColor, // <-- mới: màu chữ (nếu bỏ trống sẽ dùng màu theme hiện tại)
  as: Component = "span",
  className = "",
}) => {
  useEffect(() => { ensureStyleTag(); }, []);
  const style = {
    "--shiny-duration": `${speed}s`,
    "--shiny-highlight": highlight,
    ...(textColor ? { color: textColor } : {}), // cho base currentColor
  };
  return (
    <Component
      className={`shiny-text bbta-shiny ${disabled ? "disabled" : ""} ${className}`}
      style={style}
    >
      {text}
    </Component>
  );
};

export default ShinyText;
