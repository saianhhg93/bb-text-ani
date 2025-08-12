<?php
if ( ! defined( 'ABSPATH' ) ) exit;

use Elementor\Controls_Manager;
use Elementor\Widget_Base;
use Elementor\Plugin;

class BBTA_Elementor_Widget extends Widget_Base {

	public function get_name() {
		return 'bbta_text_ani';
	}
	public function get_title() {
		return __( 'BB Text Ani', 'bb-text-ani' );
	}
	public function get_icon() {
		return 'eicon-animation';
	}
	public function get_categories() {
		return [ 'general' ];
	}

	// Quan trọng: đồng bộ với bb-text-ani.php
	public function get_script_depends() {
		return [ 'bbta-index' ];
	}
	public function get_style_depends() {
		return [ 'bbta-style' ];
	}

	/* -------------------- CONTROLS -------------------- */
	protected function register_controls() {

		// ========== General ==========
		$this->start_controls_section( 'bbta_general', [
			'label' => __( 'Cấu hình chung', 'bb-text-ani' ),
			'tab'   => Controls_Manager::TAB_CONTENT,
		] );

		$this->add_control( 'type', [
			'label'   => __( 'Hiệu ứng', 'bb-text-ani' ),
			'type'    => Controls_Manager::SELECT,
			'default' => 'TextType',
			'options' => [
				'TextType'      => 'TextType (Typing)',
				'BlurText'      => 'BlurText',
				'DecryptedText' => 'DecryptedText',
				'ShinyText'     => 'ShinyText',
				'TrueFocus'     => 'TrueFocus',
				'CircularText'  => 'CircularText',
				'SplitText'     => 'SplitText',
				'FuzzyText'     => 'FuzzyText',
			],
		] );

		$this->add_control( 'text', [
			'label'       => __( 'Text hoặc JSON Array', 'bb-text-ani' ),
			'type'        => Controls_Manager::TEXTAREA,
			'rows'        => 4,
			'placeholder' => __( 'Ví dụ: Xin chào hoặc ["Xin chào","Hà Giang"]', 'bb-text-ani' ),
			'default'     => __( 'Đây là hiệu ứng Typing', 'bb-text-ani' ),
		] );

		$this->add_control( 'color', [
			'label'   => __( 'Màu chữ', 'bb-text-ani' ),
			'type'    => Controls_Manager::COLOR,
			'default' => '',
		] );

		$this->add_control( 'jsonProps', [
			'label'       => __( 'Props (JSON) — nâng cao', 'bb-text-ani' ),
			'type'        => Controls_Manager::TEXTAREA,
			'rows'        => 4,
			'placeholder' => __( 'Bạn có thể ghi đè props ở đây. UI bên dưới sẽ tự đồng bộ.', 'bb-text-ani' ),
			'default'     => '{}',
			'render_type' => 'ui',
		] );

		$this->end_controls_section();

		// ========== TextType ==========
		$this->start_controls_section( 'bbta_typing', [
			'label'     => __( 'Typing • Customize', 'bb-text-ani' ),
			'condition' => [ 'type' => 'TextType' ],
		] );

		$this->add_control( 'typingSpeed', [
			'label'   => __( 'Typing Speed (ms)', 'bb-text-ani' ),
			'type'    => Controls_Manager::NUMBER,
			'min'     => 1,
			'max'     => 500,
			'default' => 50,
		] );
		$this->add_control( 'deletingSpeed', [
			'label'   => __( 'Deleting Speed (ms)', 'bb-text-ani' ),
			'type'    => Controls_Manager::NUMBER,
			'min'     => 1,
			'max'     => 500,
			'default' => 30,
		] );
		$this->add_control( 'pauseDuration', [
			'label'   => __( 'Pause Duration (ms)', 'bb-text-ani' ),
			'type'    => Controls_Manager::NUMBER,
			'min'     => 0,
			'max'     => 10000,
			'default' => 2000,
		] );
		$this->add_control( 'loop', [
			'label'        => __( 'Loop', 'bb-text-ani' ),
			'type'         => Controls_Manager::SWITCHER,
			'label_on'     => 'On',
			'label_off'    => 'Off',
			'return_value' => 'yes',
			'default'      => 'yes',
		] );
		$this->add_control( 'showCursor', [
			'label'        => __( 'Show Cursor', 'bb-text-ani' ),
			'type'         => Controls_Manager::SWITCHER,
			'return_value' => 'yes',
			'default'      => 'yes',
		] );
		$this->add_control( 'hideCursorWhileTyping', [
			'label'        => __( 'Hide Cursor While Typing', 'bb-text-ani' ),
			'type'         => Controls_Manager::SWITCHER,
			'return_value' => 'yes',
			'default'      => '',
		] );
		$this->add_control( 'cursorCharacter', [
			'label'   => __( 'Cursor Character', 'bb-text-ani' ),
			'type'    => Controls_Manager::SELECT,
			'default' => '|',
			'options' => [
				'|' => 'Pipe (|)',
				'_' => 'Underscore (_)',
				'▮' => 'Full Block (▮)',
				'•' => 'Dot (•)',
			],
		] );
		$this->add_control( 'cursorBlinkDuration', [
			'label'   => __( 'Cursor Blink Duration (s)', 'bb-text-ani' ),
			'type'    => Controls_Manager::NUMBER,
			'min'     => 0.1,
			'max'     => 5,
			'default' => 0.5,
		] );
		$this->add_control( 'variableSpeed', [
			'label'        => __( 'Variable Speed', 'bb-text-ani' ),
			'type'         => Controls_Manager::SWITCHER,
			'return_value' => 'yes',
			'default'      => '',
		] );
		$this->add_control( 'variableSpeedMin', [
			'label'     => __( 'Variable Speed Min (ms)', 'bb-text-ani' ),
			'type'      => Controls_Manager::NUMBER,
			'default'   => 60,
			'condition' => [ 'variableSpeed' => 'yes' ],
		] );
		$this->add_control( 'variableSpeedMax', [
			'label'     => __( 'Variable Speed Max (ms)', 'bb-text-ani' ),
			'type'      => Controls_Manager::NUMBER,
			'default'   => 120,
			'condition' => [ 'variableSpeed' => 'yes' ],
		] );
		$this->add_control( 'startOnVisible', [
			'label'        => __( 'Start On Visible', 'bb-text-ani' ),
			'type'         => Controls_Manager::SWITCHER,
			'return_value' => 'yes',
			'default'      => '',
		] );
		$this->add_control( 'reverseMode', [
			'label'        => __( 'Reverse Mode', 'bb-text-ani' ),
			'type'         => Controls_Manager::SWITCHER,
			'return_value' => 'yes',
			'default'      => '',
		] );
		$this->add_control( 'asTag', [
			'label'   => __( 'HTML Tag', 'bb-text-ani' ),
			'type'    => Controls_Manager::SELECT,
			'default' => 'div',
			'options' => [
				'div' => 'div','span'=>'span','h1'=>'h1','h2'=>'h2','h3'=>'h3','h4'=>'h4','h5'=>'h5','h6'=>'h6'
			],
		] );

		$this->end_controls_section();

		// ========== Blur ==========
		$this->start_controls_section( 'bbta_blur', [
			'label'     => __( 'Blur • Customize', 'bb-text-ani' ),
			'condition' => [ 'type' => 'BlurText' ],
		] );
		$this->add_control( 'blurAmount', [
			'label'   => __( 'Blur Amount (px)', 'bb-text-ani' ),
			'type'    => Controls_Manager::NUMBER,
			'min'     => 0,
			'max'     => 20,
			'default' => 5,
		] );
		$this->add_control( 'transitionSeconds', [
			'label'   => __( 'Transition (s)', 'bb-text-ani' ),
			'type'    => Controls_Manager::NUMBER,
			'min'     => 0.05,
			'max'     => 5,
			'default' => 0.5,
		] );
		$this->add_control( 'animateOn_blur', [
			'label'   => __( 'Animate On', 'bb-text-ani' ),
			'type'    => Controls_Manager::SELECT,
			'default' => 'view',
			'options' => [ 'view'=>'view','hover'=>'hover' ],
		] );
		$this->add_control( 'loop_blur', [
			'label'        => __( 'Loop (view only)', 'bb-text-ani' ),
			'type'         => Controls_Manager::SWITCHER,
			'return_value' => 'yes',
			'default'      => '',
		] );
		$this->add_control( 'loopPause_blur', [
			'label'     => __( 'Loop Pause (ms)', 'bb-text-ani' ),
			'type'      => Controls_Manager::NUMBER,
			'default'   => 1200,
			'condition' => [ 'loop_blur' => 'yes' ],
		] );
		$this->end_controls_section();

		// ========== Decrypted ==========
		$this->start_controls_section( 'bbta_decrypted', [
			'label'     => __( 'Decrypted • Customize', 'bb-text-ani' ),
			'condition' => [ 'type' => 'DecryptedText' ],
		] );
		$this->add_control( 'speed_dec', [
			'label'   => __( 'Speed (ms)', 'bb-text-ani' ),
			'type'    => Controls_Manager::NUMBER,
			'default' => 50,
		] );
		$this->add_control( 'maxIterations', [
			'label'   => __( 'Max Iterations', 'bb-text-ani' ),
			'type'    => Controls_Manager::NUMBER,
			'default' => 10,
		] );
		$this->add_control( 'sequential', [
			'label'        => __( 'Sequential', 'bb-text-ani' ),
			'type'         => Controls_Manager::SWITCHER,
			'return_value' => 'yes',
			'default'      => '',
		] );
		$this->add_control( 'revealDirection', [
			'label'   => __( 'Reveal Direction', 'bb-text-ani' ),
			'type'    => Controls_Manager::SELECT,
			'default' => 'start',
			'options' => [ 'start'=>'start','end'=>'end','center'=>'center' ],
		] );
		$this->add_control( 'useOriginalCharsOnly', [
			'label'        => __( 'Original Chars Only', 'bb-text-ani' ),
			'type'         => Controls_Manager::SWITCHER,
			'return_value' => 'yes',
			'default'      => '',
		] );
		$this->add_control( 'animateOn_dec', [
			'label'   => __( 'Animate On', 'bb-text-ani' ),
			'type'    => Controls_Manager::SELECT,
			'default' => 'hover',
			'options' => [ 'hover'=>'hover','view'=>'view' ],
		] );
		$this->add_control( 'loop_dec', [
			'label'        => __( 'Loop (chỉ khi animateOn = view)', 'bb-text-ani' ),
			'type'         => Controls_Manager::SWITCHER,
			'return_value' => 'yes',
			'default'      => '',
		] );
		$this->add_control( 'loopPause_dec', [
			'label'     => __( 'Loop Pause (ms)', 'bb-text-ani' ),
			'type'      => Controls_Manager::NUMBER,
			'default'   => 1000,
			'condition' => [ 'loop_dec' => 'yes' ],
		] );
		$this->end_controls_section();

		// ========== Shiny ==========
		$this->start_controls_section( 'bbta_shiny', [
			'label'     => __( 'Shiny • Customize', 'bb-text-ani' ),
			'condition' => [ 'type' => 'ShinyText' ],
		] );
		$this->add_control( 'disabled_shiny', [
			'label'        => __( 'Disable', 'bb-text-ani' ),
			'type'         => Controls_Manager::SWITCHER,
			'return_value' => 'yes',
			'default'      => '',
		] );
		$this->add_control( 'speed_shiny', [
			'label'   => __( 'Animation Duration (s)', 'bb-text-ani' ),
			'type'    => Controls_Manager::NUMBER,
			'default' => 3,
		] );
		$this->add_control( 'highlight', [
			'label'   => __( 'Highlight (màu/rgba/gradient)', 'bb-text-ani' ),
			'type'    => Controls_Manager::TEXT,
			'default' => '',
		] );
		$this->end_controls_section();

		// ========== TrueFocus ==========
		$this->start_controls_section( 'bbta_truefocus', [
			'label'     => __( 'True Focus • Customize', 'bb-text-ani' ),
			'condition' => [ 'type' => 'TrueFocus' ],
		] );
		$this->add_control( 'borderColor', [
			'label'   => __( 'Border Color', 'bb-text-ani' ),
			'type'    => Controls_Manager::COLOR,
			'default' => '#22c55e',
		] );
		$this->add_control( 'glowColor', [
			'label'   => __( 'Glow Color', 'bb-text-ani' ),
			'type'    => Controls_Manager::COLOR,
			'default' => 'rgba(34,197,94,0.6)',
		] );
		$this->add_control( 'manualMode', [
			'label'        => __( 'Hover Mode (Manual)', 'bb-text-ani' ),
			'type'         => Controls_Manager::SWITCHER,
			'return_value' => 'yes',
			'default'      => '',
		] );
		$this->add_control( 'blurAmount_tf', [
			'label'   => __( 'Blur Amount (px)', 'bb-text-ani' ),
			'type'    => Controls_Manager::NUMBER,
			'default' => 2,
		] );
		$this->add_control( 'animationDuration_tf', [
			'label'   => __( 'Animation Duration (s)', 'bb-text-ani' ),
			'type'    => Controls_Manager::NUMBER,
			'default' => 0.2,
		] );
		$this->add_control( 'pauseBetweenAnimations', [
			'label'   => __( 'Pause Between Animations (s)', 'bb-text-ani' ),
			'type'    => Controls_Manager::NUMBER,
			'default' => 1,
		] );
		$this->add_control( 'cornersOnly', [
			'label'        => __( 'Chỉ hiện 4 góc', 'bb-text-ani' ),
			'type'         => Controls_Manager::SWITCHER,
			'return_value' => 'yes',
			'default'      => 'yes',
		] );
		$this->end_controls_section();

		// ========== Circular ==========
		$this->start_controls_section( 'bbta_circular', [
			'label'     => __( 'Circular • Customize', 'bb-text-ani' ),
			'condition' => [ 'type' => 'CircularText' ],
		] );
		$this->add_control( 'spinDuration', [
			'label'   => __( 'Spin Duration (s)', 'bb-text-ani' ),
			'type'    => Controls_Manager::NUMBER,
			'default' => 20,
		] );
		$this->add_control( 'onHover', [
			'label'   => __( 'On Hover', 'bb-text-ani' ),
			'type'    => Controls_Manager::SELECT,
			'default' => 'pause',
			'options' => [
				'slowDown'  => 'slowDown',
				'speedUp'   => 'speedUp',
				'pause'     => 'pause',
				'goBonkers' => 'goBonkers',
				'none'      => 'none',
			],
		] );
		$this->add_control( 'radius', [
			'label'   => __( 'Radius (px)', 'bb-text-ani' ),
			'type'    => Controls_Manager::NUMBER,
			'default' => 90,
		] );
		$this->add_control( 'charSpacing', [
			'label'   => __( 'Char Spacing (deg)', 'bb-text-ani' ),
			'type'    => Controls_Manager::NUMBER,
			'default' => 12,
		] );
		$this->end_controls_section();

		// ========== Split ==========
		$this->start_controls_section( 'bbta_split', [
			'label'     => __( 'Split • Customize', 'bb-text-ani' ),
			'condition' => [ 'type' => 'SplitText' ],
		] );
		$this->add_control( 'splitType', [
			'label'   => __( 'Split Type', 'bb-text-ani' ),
			'type'    => Controls_Manager::SELECT,
			'default' => 'chars',
			'options' => [ 'chars'=>'chars','words'=>'words','lines'=>'lines' ],
		] );
		$this->add_control( 'ease', [
			'label'   => __( 'Ease', 'bb-text-ani' ),
			'type'    => Controls_Manager::TEXT,
			'default' => 'power3.out',
		] );
		$this->add_control( 'delay_split', [
			'label'   => __( 'Stagger Delay (ms)', 'bb-text-ani' ),
			'type'    => Controls_Manager::NUMBER,
			'default' => 100,
		] );
		$this->add_control( 'duration_split', [
			'label'   => __( 'Duration (s)', 'bb-text-ani' ),
			'type'    => Controls_Manager::NUMBER,
			'default' => 0.6,
		] );
		$this->add_control( 'threshold', [
			'label'   => __( 'Threshold (0–1)', 'bb-text-ani' ),
			'type'    => Controls_Manager::NUMBER,
			'default' => 0.1,
		] );
		$this->add_control( 'rootMargin', [
			'label'   => __( 'Root Margin', 'bb-text-ani' ),
			'type'    => Controls_Manager::TEXT,
			'default' => '-100px',
		] );
		$this->add_control( 'textAlign', [
			'label'   => __( 'Text Align', 'bb-text-ani' ),
			'type'    => Controls_Manager::SELECT,
			'default' => 'left',
			'options' => [ 'left'=>'left','center'=>'center','right'=>'right' ],
		] );
		$this->add_control( 'loop_split', [
			'label'        => __( 'Loop', 'bb-text-ani' ),
			'type'         => Controls_Manager::SWITCHER,
			'return_value' => 'yes',
			'default'      => '',
		] );
		$this->add_control( 'loopDelay', [
			'label'     => __( 'Loop Delay (s)', 'bb-text-ani' ),
			'type'      => Controls_Manager::NUMBER,
			'default'   => 0.4,
			'condition' => [ 'loop_split' => 'yes' ],
		] );
		$this->add_control( 'yoyo', [
			'label'        => __( 'Yoyo', 'bb-text-ani' ),
			'type'         => Controls_Manager::SWITCHER,
			'return_value' => 'yes',
			'default'      => '',
		] );
		// from/to JSON
		$this->add_control( 'fromJSON', [
			'label'       => __( '`from` (JSON)', 'bb-text-ani' ),
			'type'        => Controls_Manager::TEXTAREA,
			'rows'        => 2,
			'default'     => '{"opacity":0,"y":40}',
		] );
		$this->add_control( 'toJSON', [
			'label'       => __( '`to` (JSON)', 'bb-text-ani' ),
			'type'        => Controls_Manager::TEXTAREA,
			'rows'        => 2,
			'default'     => '{"opacity":1,"y":0}',
		] );
		$this->end_controls_section();

		// ========== Fuzzy ==========
		$this->start_controls_section( 'bbta_fuzzy', [
			'label'     => __( 'Fuzzy • Customize', 'bb-text-ani' ),
			'condition' => [ 'type' => 'FuzzyText' ],
		] );
		$this->add_control( 'baseIntensity', [
			'label'   => __( 'Base Intensity', 'bb-text-ani' ),
			'type'    => Controls_Manager::NUMBER,
			'min'     => 0,
			'max'     => 1,
			'step'    => 0.01,
			'default' => 0.18,
		] );
		$this->add_control( 'hoverIntensity', [
			'label'   => __( 'Hover Intensity', 'bb-text-ani' ),
			'type'    => Controls_Manager::NUMBER,
			'min'     => 0,
			'max'     => 2,
			'step'    => 0.01,
			'default' => 0.5,
		] );
		$this->add_control( 'enableHover', [
			'label'        => __( 'Enable Hover', 'bb-text-ani' ),
			'type'         => Controls_Manager::SWITCHER,
			'return_value' => 'yes',
			'default'      => 'yes',
		] );
		$this->add_control( 'fontSize_fz', [
			'label'       => __( 'Font Size (CSS or px)', 'bb-text-ani' ),
			'type'        => Controls_Manager::TEXT,
			'placeholder' => __( 'VD: 64, 48px, clamp(2rem,8vw,8rem)', 'bb-text-ani' ),
			'default'     => '',
		] );
		$this->add_control( 'fontWeight_fz', [
			'label'   => __( 'Font Weight', 'bb-text-ani' ),
			'type'    => Controls_Manager::TEXT,
			'default' => '',
		] );
		$this->add_control( 'fontFamily', [
			'label'   => __( 'Font Family', 'bb-text-ani' ),
			'type'    => Controls_Manager::TEXT,
			'default' => '',
		] );
		$this->end_controls_section();

		// ========== Shortcode Preview ==========
		$this->start_controls_section( 'bbta_shortcode', [
			'label' => __( 'Shortcode • Preview', 'bb-text-ani' ),
		] );
		$this->add_control( 'shortcode_preview', [
			'type'            => Controls_Manager::RAW_HTML,
		    'raw'             => '<div class="bbta-shortcode-preview-wrapper"><textarea readonly class="bbta-shortcode-preview" style="width:100%;font-family:monospace;background:#f6f7f7;border:1px solid #ddd;padding:10px;border-radius:6px;white-space:pre;user-select:all;resize:vertical" rows="3"></textarea><div style="margin-top:6px;color:#666">'.esc_html__( 'Ô này chỉ hiển thị trong trình dựng để bạn copy nhanh.', 'bb-text-ani' ).'</div></div>',
			'content_classes' => 'bbta-shortcode-wrap',
		] );
		$this->end_controls_section();
	}

	/* -------------------- RENDER -------------------- */
	protected function render() {
		$s = $this->get_settings_for_display();

		// Parse TEXT (string or JSON array)
		$text = isset( $s['text'] ) ? $s['text'] : '';
		$maybe_json = json_decode( (string) $text, true );
		if ( json_last_error() === JSON_ERROR_NONE ) {
			$text = $maybe_json;
		}

		// Parse JSON props (advanced)
		$props = [];
		if ( ! empty( $s['jsonProps'] ) ) {
			$tmp = json_decode( (string) $s['jsonProps'], true );
			if ( is_array( $tmp ) ) $props = $tmp;
		}

		// Merge color (nếu có)
		if ( ! empty( $s['color'] ) ) {
			$props['color'] = $s['color'];
		}

		$type = isset( $s['type'] ) ? $s['type'] : 'TextType';

		// Map controls theo từng effect
		switch ( $type ) {
			case 'TextType':
				$props['typingSpeed']           = isset($s['typingSpeed']) ? (int)$s['typingSpeed'] : 50;
				$props['deletingSpeed']         = isset($s['deletingSpeed']) ? (int)$s['deletingSpeed'] : 30;
				$props['pauseDuration']         = isset($s['pauseDuration']) ? (int)$s['pauseDuration'] : 2000;
				$props['loop']                  = ! empty($s['loop']);
				$props['showCursor']            = ! empty($s['showCursor']);
				$props['hideCursorWhileTyping'] = ! empty($s['hideCursorWhileTyping']);
				$props['cursorCharacter']       = isset($s['cursorCharacter']) ? $s['cursorCharacter'] : '|';
				$props['cursorBlinkDuration']   = isset($s['cursorBlinkDuration']) ? (float)$s['cursorBlinkDuration'] : 0.5;
				if ( ! empty( $s['variableSpeed'] ) ) {
					$props['variableSpeed'] = [
						'min' => isset($s['variableSpeedMin']) ? (int)$s['variableSpeedMin'] : 60,
						'max' => isset($s['variableSpeedMax']) ? (int)$s['variableSpeedMax'] : 120,
					];
				}
				$props['startOnVisible'] = ! empty($s['startOnVisible']);
				$props['reverseMode']    = ! empty($s['reverseMode']);
				$props['as']             = isset($s['asTag']) ? $s['asTag'] : 'div';
				break;

			case 'BlurText':
				$props['blurAmount']  = isset($s['blurAmount']) ? (int)$s['blurAmount'] : 5;
				$props['speed']       = isset($s['transitionSeconds']) ? (float)$s['transitionSeconds'] : 0.5;
				$props['animateOn']   = !empty($s['animateOn_blur']) ? $s['animateOn_blur'] : 'view';
				$props['loop']        = ! empty($s['loop_blur']);
				$props['loopPause']   = isset($s['loopPause_blur']) ? (int)$s['loopPause_blur'] : 1200;
				break;

			case 'DecryptedText':
				$props['speed']                = isset($s['speed_dec']) ? (int)$s['speed_dec'] : 50;
				$props['maxIterations']        = isset($s['maxIterations']) ? (int)$s['maxIterations'] : 10;
				$props['sequential']           = ! empty($s['sequential']);
				$props['revealDirection']      = ! empty($s['revealDirection']) ? $s['revealDirection'] : 'start';
				$props['useOriginalCharsOnly'] = ! empty($s['useOriginalCharsOnly']);
				$props['animateOn']            = ! empty($s['animateOn_dec']) ? $s['animateOn_dec'] : 'hover';
				$props['loop']                 = ! empty($s['loop_dec']);
				$props['loopPause']            = isset($s['loopPause_dec']) ? (int)$s['loopPause_dec'] : 1000;
				break;

			case 'ShinyText':
				$props['disabled'] = ! empty($s['disabled_shiny']);
				$props['speed']    = isset($s['speed_shiny']) ? (float)$s['speed_shiny'] : 3;
				if ( ! empty($s['highlight']) ) $props['highlight'] = $s['highlight'];
				break;

			case 'TrueFocus':
				if ( ! empty($s['borderColor']) ) $props['borderColor'] = $s['borderColor'];
				if ( ! empty($s['glowColor']) )   $props['glowColor']   = $s['glowColor'];
				$props['manualMode']           = ! empty($s['manualMode']);
				$props['blurAmount']           = isset($s['blurAmount_tf']) ? (int)$s['blurAmount_tf'] : 2;
				$props['animationDuration']    = isset($s['animationDuration_tf']) ? (float)$s['animationDuration_tf'] : 0.2;
				$props['pauseBetweenAnimations'] = isset($s['pauseBetweenAnimations']) ? (float)$s['pauseBetweenAnimations'] : 1;
				$props['cornersOnly']          = ! empty($s['cornersOnly']);
				break;

			case 'CircularText':
				$props['spinDuration'] = isset($s['spinDuration']) ? (float)$s['spinDuration'] : 20;
				$props['onHover']      = ! empty($s['onHover']) ? $s['onHover'] : 'pause';
				$props['radius']       = isset($s['radius']) ? (int)$s['radius'] : 90;
				$props['charSpacing']  = isset($s['charSpacing']) ? (int)$s['charSpacing'] : 12;
				break;

			case 'SplitText':
				$props['splitType'] = ! empty($s['splitType']) ? $s['splitType'] : 'chars';
				$props['ease']      = ! empty($s['ease']) ? $s['ease'] : 'power3.out';
				$props['delay']     = isset($s['delay_split']) ? (int)$s['delay_split'] : 100;
				$props['duration']  = isset($s['duration_split']) ? (float)$s['duration_split'] : 0.6;
				$props['threshold'] = isset($s['threshold']) ? (float)$s['threshold'] : 0.1;
				$props['rootMargin']= isset($s['rootMargin']) ? $s['rootMargin'] : '-100px';
				$props['textAlign'] = isset($s['textAlign']) ? $s['textAlign'] : 'left';
				$props['loop']      = ! empty($s['loop_split']);
				$props['loopDelay'] = isset($s['loopDelay']) ? (float)$s['loopDelay'] : 0.4;
				$props['yoyo']      = ! empty($s['yoyo']);
				// from/to JSON
				$from = json_decode( (string) ($s['fromJSON'] ?? ''), true );
				if ( is_array( $from ) ) $props['from'] = $from;
				$to = json_decode( (string) ($s['toJSON'] ?? ''), true );
				if ( is_array( $to ) ) $props['to'] = $to;
				break;

			case 'FuzzyText':
				$props['baseIntensity']  = isset($s['baseIntensity']) ? (float)$s['baseIntensity'] : 0.18;
				$props['hoverIntensity'] = isset($s['hoverIntensity']) ? (float)$s['hoverIntensity'] : 0.5;
				$props['enableHover']    = ! empty($s['enableHover']);
				if ( ! empty($s['fontSize_fz']) )   $props['fontSize']   = $s['fontSize_fz'];
				if ( ! empty($s['fontWeight_fz']) ) $props['fontWeight'] = $s['fontWeight_fz'];
				if ( ! empty($s['fontFamily']) )    $props['fontFamily'] = $s['fontFamily'];
				break;
		}

		$data = [
			'type'  => $type,
			'props' => array_merge( [ 'text' => $text ], $props ),
		];

		// Enqueue đúng handle để frontend Elementor render được
		wp_enqueue_script( 'bbta-index' );
		wp_enqueue_style( 'bbta-style' );

// Tạo nội dung fallback để hiển thị trước khi React chạy
$fallback_text = is_array($text) ? implode(' ', $text) : (string)$text;

echo '<div class="bbta-root" data-bbta="' . esc_attr( wp_json_encode( $data ) ) . '">' . esc_html( $fallback_text ) . '</div>';

		// -------- Shortcode Preview (chỉ hiển thị trong editor) --------
		if ( Plugin::$instance->editor->is_edit_mode() ) {
			$shortcode = sprintf(
				'[bbta type="%s" text="%s" props=\'%s\']',
				esc_attr( $type ),
				is_array($text) ? esc_attr( wp_json_encode( $text ) ) : esc_attr( $text ),
				esc_attr( wp_json_encode( $props ) )
			);
			?>
			<script>
			(function(){
				const wrap = document.currentScript.previousElementSibling;
				// previous sibling is our bbta-root; preview box is created by RAW_HTML control above (same section)
				const previewBox = wrap && wrap.parentElement && wrap.parentElement.querySelector('.bbta-shortcode-preview');
				if (previewBox) {
					previewBox.textContent = <?php echo wp_json_encode( $shortcode ); ?>;
				}
			})();
			</script>
			<?php
		}
	}
}
