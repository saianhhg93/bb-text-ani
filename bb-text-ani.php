<?php
/**
 * Plugin Name: bb-text-ani
 * Description: Hiệu ứng chữ React kèm Gutenberg Block, Elementor & Shortcode.
 * Version: 1.2.2
 * Author: Ha Giang Tech
 * Text Domain: bb-text-ani
 */
if ( ! defined('ABSPATH') ) exit;

define('BBTA_VERSION', '1.2.2');
define('BBTA_PLUGIN_FILE', __FILE__);
define('BBTA_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('BBTA_PLUGIN_URL', plugin_dir_url(__FILE__));

/* ---------------------------------------------------------
 * 1) KSES: cho phép data-bbta trong post content
 * --------------------------------------------------------- */
add_filter('wp_kses_allowed_html', function ($tags, $context) {
	if ($context === 'post') {
		if (!isset($tags['div'])) $tags['div'] = [];
		$tags['div']['data-bbta'] = true;
	}
	return $tags;
}, 10, 2);

/* ---------------------------------------------------------
 * 2) Đăng ký asset build (đọc index.asset.php để lấy deps)
 * --------------------------------------------------------- */
function bbta_locate_build_file(array $candidates) {
	foreach ($candidates as $rel) {
		$abs = BBTA_PLUGIN_DIR . ltrim($rel, '/\\');
		if (file_exists($abs)) return [$abs, plugins_url($rel, BBTA_PLUGIN_FILE)];
	}
	return ['', ''];
}

function bbta_register_assets() {
	list($js_abs, $js_url) = bbta_locate_build_file(['build/index.js', 'index.js']);
	$deps = ['wp-element']; $ver = BBTA_VERSION;

	foreach (['build/index.asset.php','index.asset.php'] as $rel) {
		$asset_abs = BBTA_PLUGIN_DIR . $rel;
		if (file_exists($asset_abs)) {
			$asset = include $asset_abs;
			if (is_array($asset)) {
				if (!empty($asset['dependencies'])) $deps = $asset['dependencies'];
				if (!empty($asset['version']))      $ver  = $asset['version'];
			}
			break;
		}
	}

	if ($js_url) {
		wp_register_script('bbta-index', $js_url, $deps, $ver, true);
		$bootstrap = <<<JS
(function(){
	function mountAll(){
		var nodes=document.querySelectorAll('.bbta-root');
		nodes.forEach(function(n){
			try{
				var p=n.getAttribute('data-bbta');
				if(!p) return;
				p=JSON.parse(p);
				if(window.BBTA && typeof window.BBTA.render==='function'){
					window.BBTA.render(n,p);
				}
			}catch(e){console.error('BBTA mount error:',e);}
		});
	}
	if(document.readyState==='complete'||document.readyState==='interactive'){setTimeout(mountAll,0);}
	else{document.addEventListener('DOMContentLoaded',mountAll);}
	if(window.jQuery&&window.elementorFrontend){jQuery(window).on('elementor/frontend/init',mountAll);}
})();
JS;
		wp_add_inline_script('bbta-index', $bootstrap, 'after');
	}

	list($css_abs, $css_url) = bbta_locate_build_file([
		'build/style-index.css','build/index.css','style-index.css','index.css'
	]);
	if ($css_url) wp_register_style('bbta-style', $css_url, [], $ver);
}
add_action('init', 'bbta_register_assets');

/* ---------------------------------------------------------
 * 3) Build payload data-bbta (bịt mọi case text rỗng)
 * --------------------------------------------------------- */
function bbta_build_payload($type, $text, $props_json, $content_fallback = '') {
	// text attribute (có thể là chuỗi hoặc JSON array)
	$text_attr = html_entity_decode(wp_unslash((string)$text), ENT_QUOTES, 'UTF-8');
	$maybe = json_decode($text_attr, true);
	if (json_last_error() === JSON_ERROR_NONE && is_array($maybe)) {
		$text_attr = $maybe; // cho phép mảng
	}

	// props JSON
	$props_raw = wp_unslash((string)$props_json);
	$props = json_decode($props_raw, true);
	if (!is_array($props)) $props = [];

	// Đổ lại text nếu thiếu hoặc rỗng
	$need_text = !array_key_exists('text',$props) || $props['text']==='' || $props['text']===null;
	if ($need_text) {
		$props['text'] = ($text_attr !== '' && $text_attr !== null) ? $text_attr : $content_fallback;
	}

	// children fallback
	if (!array_key_exists('children',$props) || $props['children']==='' || $props['children']===null) {
		$props['children'] = $props['text'];
	}

	return [
		'type'  => (string)$type,
		'props' => $props,
	];
}

/* ---------------------------------------------------------
 * 4) Dynamic block render: luôn in markup .bbta-root
 * --------------------------------------------------------- */
function bbta_block_render($attributes, $content = '') {
	$type      = isset($attributes['type']) ? $attributes['type'] : 'TextType';
	$text      = isset($attributes['text']) ? $attributes['text'] : '';
	$jsonProps = isset($attributes['jsonProps']) ? $attributes['jsonProps'] : '{}';

	$data = bbta_build_payload($type, $text, $jsonProps, $content);

	// Fallback text để in vào giữa div (đọc TỪ THUỘC TÍNH text gốc)
	$text_attr = html_entity_decode(wp_unslash((string)$text), ENT_QUOTES, 'UTF-8');
	$maybe = json_decode($text_attr, true);
	if (json_last_error() === JSON_ERROR_NONE && is_array($maybe)) {
		$text_attr = implode(' ', array_map('strval', $maybe));
	}
	$fallback_text = ($text_attr !== '') ? $text_attr : (string)$content;

	if (wp_script_is('bbta-index','registered')) wp_enqueue_script('bbta-index');
	if (wp_style_is('bbta-style','registered'))  wp_enqueue_style('bbta-style');

	return '<div class="bbta-root" data-bbta="' . esc_attr(wp_json_encode($data)) . '">' .
		esc_html($fallback_text) .
	'</div>';
}

/* ---------------------------------------------------------
 * 5) Đăng ký block DYNAMIC
 * --------------------------------------------------------- */
add_action('init', function () {
	if (!function_exists('register_block_type')) return;

	$args = [
		'attributes'      => [
			'type'      => ['type'=>'string','default'=>'TextType'],
			'text'      => ['type'=>'string','default'=>''],
			'jsonProps' => ['type'=>'string','default'=>'{}'],
		],
		'render_callback' => 'bbta_block_render',
	];

	if (wp_script_is('bbta-index','registered')) {
		$args['editor_script'] = 'bbta-index';
		$args['script']        = 'bbta-index';
	}
	if (wp_style_is('bbta-style','registered')) {
		$args['style']        = 'bbta-style';
		$args['editor_style'] = 'bbta-style';
	}

	register_block_type('bbta/text-ani', $args);
});

/* ---------------------------------------------------------
 * 6) Shortcode renderer + đăng ký shortcode SỚM
 * --------------------------------------------------------- */
function bbta_render_shortcode_cb($atts = [], $content = null, $tag = '') {
	$atts = shortcode_atts([
		'type'  => 'TextType',
		'text'  => '',
		'props' => '{}',
	], $atts, $tag ?: 'bbta');

	$data = bbta_build_payload($atts['type'], $atts['text'], $atts['props'], $content);

	// Fallback text in div: lấy từ $atts['text'] gốc hoặc $content
	$text_attr = html_entity_decode(wp_unslash((string)$atts['text']), ENT_QUOTES, 'UTF-8');
	$maybe = json_decode($text_attr, true);
	if (json_last_error() === JSON_ERROR_NONE && is_array($maybe)) {
		$text_attr = implode(' ', array_map('strval', $maybe));
	}
	$fallback_text = ($text_attr !== '') ? $text_attr : (string)$content;

	if (wp_script_is('bbta-index','registered')) wp_enqueue_script('bbta-index');
	if (wp_style_is('bbta-style','registered'))  wp_enqueue_style('bbta-style');

	return '<div class="bbta-root" data-bbta="' . esc_attr(wp_json_encode($data)) . '">' .
		esc_html($fallback_text) .
	'</div>';
}

// Đăng ký shortcode SỚM (priority 1)
add_action('init', function () {
	remove_shortcode('bbta');
	remove_shortcode('bb_text_ani');
	add_shortcode('bbta', 'bbta_render_shortcode_cb');
	add_shortcode('bb_text_ani', 'bbta_render_shortcode_cb');
}, 1);

// Bảo đảm dạng [bbta]...[/bbta] luôn được render đúng, type không bị rớt
add_filter('pre_do_shortcode_tag', function ($output, $tag, $attr, $m) {
    if ($tag !== 'bbta' && $tag !== 'bb_text_ani') return $output;

    // 1) Lấy chuỗi attr & content thô từ regex match
    $raw_attr    = isset($m[3]) ? $m[3] : '';
    $raw_content = isset($m[5]) ? $m[5] : '';

    // 2) Tự parse lại attr cho CHẮC (không tin vào $attr truyền vào)
    $atts = shortcode_parse_atts( trim( $raw_attr ) );
    if (!is_array($atts)) $atts = [];

    // 3) Chuẩn hoá key về lowercase
    $atts = array_change_key_case($atts, CASE_LOWER);

    // 4) Nếu vẫn chưa có type, thử bắt tay bằng regex (phòng trường hợp cú pháp “lạ”)
    if (empty($atts['type']) && preg_match('/\btype\s*=\s*"([^"]+)"/i', $raw_attr, $mm)) {
        $atts['type'] = $mm[1];
    }

    // 5) Gọi renderer chuẩn (đã xử lý fallback text + enqueue)
    return bbta_render_shortcode_cb($atts, $raw_content, $tag);
}, 1, 4);


/* ---------------------------------------------------------
 * 8) Elementor widget
 * --------------------------------------------------------- */
add_action('plugins_loaded', function () {
	if (did_action('elementor/loaded')) {
		require_once BBTA_PLUGIN_DIR . 'includes/class-bbta-elementor-widget.php';
		add_action('elementor/widgets/register', function ($widgets_manager) {
			$widgets_manager->register(new \BBTA_Elementor_Widget());
		});
	}
});
