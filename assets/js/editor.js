jQuery(window).on('elementor:init', function () {
    // Hook này sẽ chạy khi panel của widget BB Text Ani được mở ra
    elementor.hooks.addAction('panel/open_editor/widget/bbta_text_ani', function (panel, model, view) {

        // --- ĐỊNH NGHĨA CÁC HÀM HỖ TRỢ ---

        var buildPropsObject = function (settings) {
            var props = {};
            if (settings.color) props.color = settings.color;

            switch (settings.type) {
                case 'TextType':
                    props.typingSpeed = settings.typingSpeed;
                    props.deletingSpeed = settings.deletingSpeed;
                    props.pauseDuration = settings.pauseDuration;
                    props.loop = !!settings.loop;
                    props.showCursor = !!settings.showCursor;
                    props.hideCursorWhileTyping = !!settings.hideCursorWhileTyping;
                    props.cursorCharacter = settings.cursorCharacter;
                    props.cursorBlinkDuration = settings.cursorBlinkDuration;
                    if (settings.variableSpeed) {
                        props.variableSpeed = { min: settings.variableSpeedMin || 60, max: settings.variableSpeedMax || 120 };
                    }
                    props.startOnVisible = !!settings.startOnVisible;
                    props.reverseMode = !!settings.reverseMode;
                    props.as = settings.asTag;
                    break;
                case 'BlurText':
                    props.blurAmount = settings.blurAmount;
                    props.speed = settings.transitionSeconds;
                    props.animateOn = settings.animateOn_blur;
                    props.loop = !!settings.loop_blur;
                    props.loopPause = settings.loopPause_blur;
                    break;
                case 'DecryptedText':
                    props.speed = settings.speed_dec;
                    props.maxIterations = settings.maxIterations;
                    props.sequential = !!settings.sequential;
                    props.revealDirection = settings.revealDirection;
                    props.useOriginalCharsOnly = !!settings.useOriginalCharsOnly;
                    props.animateOn = settings.animateOn_dec;
                    props.loop = !!settings.loop_dec;
                    props.loopPause = settings.loopPause_dec;
                    break;
                case 'ShinyText':
                    props.disabled = !!settings.disabled_shiny;
                    props.speed = settings.speed_shiny;
                    if (settings.highlight) props.highlight = settings.highlight;
                    break;
                case 'TrueFocus':
                    if (settings.borderColor) props.borderColor = settings.borderColor;
                    if (settings.glowColor) props.glowColor = settings.glowColor;
                    props.manualMode = !!settings.manualMode;
                    props.blurAmount = settings.blurAmount_tf;
                    props.animationDuration = settings.animationDuration_tf;
                    props.pauseBetweenAnimations = settings.pauseBetweenAnimations;
                    props.cornersOnly = !!settings.cornersOnly;
                    break;
                case 'CircularText':
                    props.spinDuration = settings.spinDuration;
                    props.onHover = settings.onHover;
                    props.radius = settings.radius;
                    props.charSpacing = settings.charSpacing;
                    break;
                case 'SplitText':
                    props.splitType = settings.splitType;
                    props.ease = settings.ease;
                    props.delay = settings.delay_split;
                    props.duration = settings.duration_split;
                    props.threshold = settings.threshold;
                    props.rootMargin = settings.rootMargin;
                    props.textAlign = settings.textAlign;
                    props.loop = !!settings.loop_split;
                    props.loopDelay = settings.loopDelay;
                    props.yoyo = !!settings.yoyo;
                    props.showFrame = !!settings.showFrame_split;
                    if (props.showFrame && settings.frameColor_split) {
                        props.frameColor = settings.frameColor_split;
                    }
                    try { props.from = JSON.parse(settings.fromJSON || '{}'); } catch (e) {}
                    try { props.to = JSON.parse(settings.toJSON || '{}'); } catch (e) {}
                    break;
                case 'FuzzyText':
                    props.baseIntensity = settings.baseIntensity;
                    props.hoverIntensity = settings.hoverIntensity;
                    props.enableHover = !!settings.enableHover;
                    if (settings.fontSize_fz) props.fontSize = settings.fontSize_fz;
                    if (settings.fontWeight_fz) props.fontWeight = settings.fontWeight_fz;
                    if (settings.fontFamily) props.fontFamily = settings.fontFamily;
                    break;
            }
            
            Object.keys(props).forEach(function (key) {
                if (props[key] === undefined || props[key] === null || props[key] === '' || props[key] === false) {
                   delete props[key];
                }
            });
            return props;
        };
    
        var buildShortcodeString = function(settings, props) {
            var type = settings.type || 'TextType';
            var text = settings.text || '';
            var textAttr = text;
            try { JSON.parse(text); } catch (e) { textAttr = text.replace(/"/g, '&quot;'); }
            
            var propsString = '{}';
            if (Object.keys(props).length > 0) {
                propsString = JSON.stringify(props).replace(/'/g, '&#39;');
            }
            return `[bbta type="${type}" text="${textAttr}" props='${propsString}']`;
        };

        var updatePreviews = function () {
            var settings = view.getEditModel().get('settings').attributes;
            var props = buildPropsObject(settings);
            var shortcode = buildShortcodeString(settings, props);

            panel.$el.find('.elementor-control-jsonProps textarea').val(JSON.stringify(props, null, 2));
            panel.$el.find('.bbta-shortcode-preview').val(shortcode);
        };

        // --- GÁN SỰ KIỆN ---
        var debouncedUpdate = _.debounce(updatePreviews, 300);
        
        // Lắng nghe sự kiện thay đổi trên model của widget
        view.listenTo(model.get('settings'), 'change', debouncedUpdate);

        // Chạy lần đầu
        updatePreviews();
    });
});
