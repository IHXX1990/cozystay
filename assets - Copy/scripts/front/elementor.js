(function ($) {
    "use strict";

    var countDownTimers = {}, $doc = $(document), $body = $('body'), $buttonPopupBoxs = {}, $head = $('head'), isRTL = $body.hasClass('rtl');
    // Get the time of given date string in UTC format
    function getUTCTime(string) {
        var date = new Date(string);
        return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds());
    }
    function getLeftTime(now, target) {
        if (target - now > 0) {
            var totalLeft = Math.ceil((target - now) / 1000), formatDate = [];
            [60, 60, 24].forEach(function (divisor) {
                formatDate.unshift(Math.floor(totalLeft % divisor));
                totalLeft = totalLeft / divisor;
            });
            formatDate.unshift(Math.floor(totalLeft));
            return formatDate;
        } else {
            return false;
        }
    }
    function renderCountDownHTML($el, formatDate, timerID) {
        if (!formatDate) {
            clearInterval(countDownTimers[timerID]);
            formatDate = [0, 0, 0, 0];
        }
        $el.html('');
        ['days', 'hours', 'min', 'sec'].forEach(function (item, index) {
            $el.append(
                $('<span>', { 'class': 'countdown-item ' + item })
                    .append($('<span>', { 'class': 'countdown-amount', 'text': formatDate[index].toString().padStart(2, '0') }))
                    .append($('<span>', { 'class': 'countdown-period', 'text': loftoceanElementorFront.countDown[item] }))
            );
        });
    }

    var jalaliMoment = moment;
    function registerReservationForm($reservationForm) {
        if (!$reservationForm.length) return;

        var dateFormat = $reservationForm.data('date-format') ? $reservationForm.data('date-format') : 'YYYY-MM-DD',
            $checkinDate = $reservationForm.find('.checkin-date input[name="checkin"]'), $checkoutDate = $reservationForm.find('.checkout-date input'),
            $dateRangePicker = $reservationForm.find('.date-range-picker');
        isRTL ? $dateRangePicker.addClass('pull-right') : '';
        if ($checkinDate.length && $checkoutDate.length) {
            var inPopup = $reservationForm.closest('.cs-button-popup').length,
                checkinDate = moment().format(dateFormat), checkoutDate = moment().add(1, 'day').format(dateFormat),
                pickerArgs = {
                    minDate: checkinDate,
                    startDate: checkinDate,
                    endDate: checkoutDate,
                    locale: { format: dateFormat },
                    autoApply: true,
                    jalaali: isRTL ? true : false,
                    language: isRTL ? 'fa' : 'en',
                };
            if (inPopup) {
                pickerArgs.parentEl = $reservationForm.closest('.elementor-widget-container');
                pickerArgs.popupSingle = true;
            }
            $checkinDate.val(checkinDate);
            $checkoutDate.val(checkoutDate);
            $dateRangePicker.daterangepicker(pickerArgs).on('apply.daterangepicker', function (e, drp) {
                var startDate = drp.startDate.format(dateFormat), endDate = drp.endDate.format(dateFormat);
                $(this).val(startDate + ' - ' + endDate);
                $checkinDate.val(startDate);
                $checkoutDate.val(endDate);
                var jalaliStartDate = jalaliMoment(startDate, dateFormat).locale('fa').format('jYYYY-jMM-jDD');
                var jalaliEndDate = jalaliMoment(endDate, dateFormat).locale('fa').format('jYYYY-jMM-jDD');
                $('.check-in-date-show').val(jalaliStartDate);
                $('.check-out-date-show').val(jalaliEndDate);
            }).on('show.daterangepicker', function (e, drp) {
                if (inPopup) {
                    $(drp.container).addClass('single').find('.drp-calendar.right').hide();
                }
            });
            $reservationForm.find('.checkin-date, .checkout-date').on('click', function (e) {
                var dateRangePicker = $dateRangePicker.data('daterangepicker');
                dateRangePicker.setStartDate($checkinDate.val());
                dateRangePicker.setEndDate($checkoutDate.val());
                dateRangePicker.show();
            });
        }

        $reservationForm.on('click', '.has-dropdown', function (e) {
            e.preventDefault();

            var $dropdown = $(this).siblings('.csf-dropdown');
            if ($dropdown.length) {
                if ($dropdown.hasClass('is-open')) {
                    $dropdown.removeClass('is-open');
                } else {
                    $('.csf-dropdown').removeClass('is-open');
                    $dropdown.addClass('is-open');
                }
            }
        }).on('submit', function (e) {
            var $quantities = $reservationForm.find('.quantity.cs-quantity');
            if ($quantities.length) {
                $quantities.each(function (e) {
                    var $item = $(this);
                    if ($item.data('label')) {
                        var currentValue = $item.find('input').val(),
                            $itemInput = $reservationForm.find('input[type="hidden"][name="' + $item.data('label') + '_quantity_label"]').length
                                ? $reservationForm.find('input[type="hidden"][name="' + $item.data('label') + '_quantity_label"]')
                                : $('<input>', { 'type': 'hidden', 'name': $item.data('label') + '_quantity_label' }).appendTo($reservationForm);
                        if (currentValue && (currentValue > 0)) {
                            $itemInput.val(currentValue + ' ' + loftoceanElementorFront['reservation'][$item.data('label')][(currentValue < 2) ? 'single' : 'plural']);
                        } else {
                            $itemInput.val('');
                        }
                    }
                });
            }
        });
        $('.check-in-date-show, .check-out-date-show').val('');
    }

    $(window).on('elementor/frontend/init', function () {
        var $buttonPopups = $('body').find('.elementor-widget.elementor-widget-cs_button > .elementor-widget-container > .cs-button-popup');
        if ($buttonPopups.length) {
            $buttonPopups.each(function () {
                var $popup = $(this), hash = $popup.data('popup-hash');
                if (hash && !$buttonPopupBoxs[hash]) {
                    $buttonPopupBoxs[hash] = $popup;
                }
            });
        }
        $('body').on('click', '.elementor-widget.elementor-widget-cs_button > .elementor-widget-container > .elementor-button-link.popup-box-enabled', function (e) {
            var $button = $(this), $widget = $button.closest('.elementor-widget-cs_button'), $popup = false;
            if ($widget.length && (!$widget.hasClass('elementor-element-edit-mode')) && $button.data('popup-hash')) {
                var hash = $button.data('popup-hash');
                if ($buttonPopupBoxs[hash]) {
                    $popup = $buttonPopupBoxs[hash];
                } else {
                    $popup = $button.siblings('.cs-button-popup');
                    $buttonPopupBoxs[hash] = $popup.detach();
                }
                if ((false !== $popup) && $popup.length) {
                    e.preventDefault();
                    var $activedPopups = $body.children('.cs-button-popup.show');
                    $doc.trigger('beforeopen.popupbox.loftocean', [this]);
                    if ($activedPopups.length) {
                        $activedPopups.removeClass('show');
                        $activedPopups.each(function () {
                            if ($(this).data('popup-hash')) {
                                $buttonPopupBoxs[$(this).data('popup-hash')] = $(this).detach();
                            }
                        });
                    }
                    $popup.appendTo($body).removeClass('hide').addClass('show');
                    return false;
                }
            }
        }).on('click', '.cs-popup.cs-popup-box.cs-button-popup.show .close-button', function (e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            var $popup = $(this).closest('.cs-button-popup');
            $popup.removeClass('show');
            if ($popup.data('popup-hash')) {
                $buttonPopupBoxs[$popup.data('popup-hash')] = $popup.detach();
            }
            return false;
        }).on('click', function (e) {
            var $buttonPopup = $('.cs-popup.cs-popup-box.cs-button-popup.show'), $target = $(e.target);
            if ($buttonPopup.length && (!$buttonPopup.hasClass('close-manually')) && (!$target.hasClass('drp-month-button'))) {
                var $target = $(e.target), targetClass = $target.attr('class');
                if ((!$target.closest('.cs-button-popup').length) || (!targetClass) || (! /ui-/.test(targetClass))) {
                    if (!($target.parents('.cs-button-popup').length || $target.hasClass('cs-button-popup'))) {
                        $buttonPopup.removeClass('show');
                    } else {
                        $target.hasClass('container') || $target.parents('.container').length ? '' : $buttonPopup.removeClass('show');
                    }
                }
            }
            var $openedDropdown = $('.csf-dropdown.is-open');
            if ($openedDropdown.length && (!$target.is('.cs-has-dropdown, .has-dropdown')) && (!$target.parents('.cs-has-dropdown, .has-dropdown').length)) {
                $openedDropdown.removeClass('is-open');
            }
        }).on('click', '.elementor-widget-cs_reservation .cs-reservation-form .minus', function (e) {
            e.preventDefault();
            if ('on' == $(this).data('disabled')) return '';

            var $self = $(this), $buttonWrapper = $self.parent(), label = $buttonWrapper.data('label'),
                $outerInput = $self.parents('.field-wrap').first().find('.field-input-wrap input'),
                $innerInput = $self.siblings('input').first(), currentValue = parseInt($innerInput.val(), 10), minimalValue = $innerInput.data('min') || 0,
                regexString = new RegExp('\\d+ (' + loftoceanElementorFront['reservation'][label]['plural'] + '|' + loftoceanElementorFront['reservation'][label]['single'] + ')', 'ig');

            if ((!$innerInput.length) || (!$outerInput.length)) return '';

            var outerInputValue = $outerInput.val() || '';

            currentValue = isNaN(currentValue) ? 1 : currentValue;
            currentValue = currentValue <= minimalValue ? minimalValue : (currentValue - 1);
            $innerInput.val(currentValue);

            if ($outerInput.hasClass('separated-guests')) {
                outerInputValue = currentValue;
            } else {
                if (regexString.test(outerInputValue)) {
                    outerInputValue = outerInputValue.replace(regexString, currentValue + ' ' + loftoceanElementorFront['reservation'][label][(currentValue < 2) ? 'single' : 'plural'])
                } else {
                    var extraValue = currentValue + ' ' + loftoceanElementorFront['reservation'][label][(currentValue < 2) ? 'single' : 'plural'];
                    outerInputValue = ('adult' == label) ? extraValue + ', ' + outerInputValue : outerInputValue + ', ' + extraValue;
                }
            }
            $outerInput.val(outerInputValue);
            $self.siblings('.plus').removeClass('disabled').data('disabled', '').removeAttr('disabled');
            minimalValue === currentValue ? $self.data('disabled', 'on').addClass('disabled').attr('disabled', 'disabled') : '';
        }).on('click', '.elementor-widget-cs_reservation .cs-reservation-form .plus', function (e) {
            e.preventDefault();
            if ('on' == $(this).data('disabled')) return '';

            var $self = $(this), $buttonWrapper = $self.parent(), label = $buttonWrapper.data('label'),
                $outerInput = $self.parents('.field-wrap').first().find('.field-input-wrap input'),
                $innerInput = $self.siblings('input').first(), currentValue = parseInt($innerInput.val(), 10),
                regexString = new RegExp('\\d+ (' + loftoceanElementorFront['reservation'][label]['plural'] + '|' + loftoceanElementorFront['reservation'][label]['single'] + ')', 'ig');

            if ((!$innerInput.length) || (!$outerInput.length)) return '';

            var outerInputValue = $outerInput.val() || '';

            currentValue = isNaN(currentValue) ? 1 : currentValue;
            currentValue = currentValue < 1 ? 1 : (currentValue + 1);
            $innerInput.val(currentValue);
            if ($outerInput.hasClass('separated-guests')) {
                outerInputValue = currentValue;
            } else {
                if (regexString.test(outerInputValue)) {
                    outerInputValue = outerInputValue.replace(regexString, currentValue + ' ' + loftoceanElementorFront['reservation'][label][(currentValue < 2) ? 'single' : 'plural'])
                } else {
                    var extraValue = currentValue + ' ' + loftoceanElementorFront['reservation'][label][(currentValue < 2) ? 'single' : 'plural'];
                    outerInputValue = ('adult' == label) ? extraValue + ', ' + outerInputValue : outerInputValue + ', ' + extraValue;
                }
            }
            $outerInput.val(outerInputValue);
            $self.siblings('.minus').removeClass('disabled').removeAttr('disabled').data('disabled', '');
        });

        elementorFrontend.hooks.addAction('frontend/element_ready/global', function ($scope) {
            if ($scope.css('background-image')) {
                if ($scope.hasClass('cs-parallax-on-scroll')) {
                    $('body').trigger('add.loftoceanParallax', $scope);
                } else {
                    $scope.css('background-image', '');
                }
            }
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/cs_button.default', function ($scope) {
            var $link = $scope.children('.elementor-widget-container').children('a.elementor-button-link'), widgetID = $scope.data('id');
            if ($link.length) {
                if ($scope.hasClass('elementor-element-edit-mode') && ('undefined' !== typeof elementor)) {
                    var $activedPopups = $body.children('.cs-button-popup');
                    if ($activedPopups.length) {
                        var $previewButton = elementor.panel.$el.find('.elementor-control-popup_box_preview .elementor-control-input-wrapper button');
                        $activedPopups.each(function () {
                            var $popup = $(this);
                            if ($popup.data('popup-hash')) {
                                $popup.removeClass('show');
                                $buttonPopupBoxs[$popup.data('popup-hash')] = $popup.detach();
                            } else {
                                $(this).hasClass('cs-button-popup-' + widgetID) ? $(this).remove() : '';
                            }
                        });
                        $previewButton.trigger('click');
                    }
                } else {
                    var $popup = $link.siblings('.cs-button-popup');
                    if ($popup.length) {
                        var $customStyle = $popup.find('link[type="text/css"], style');
                        $customStyle.length ? $popup.before($customStyle) : '';
                        // $popup.find( '.pick-date' ).length ? $popup.addClass( 'close-manually' ) : '';
                    }
                }
            }
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/wp-widget-loftocean-widget_facebook.default', function ($scope) {
            if ($body.hasClass('elementor-editor-active') && (typeof FB !== 'undefined') && $scope.find('.loftocean-fb-page').length) {
                if (!$scope.find('.loftocean-fb-page').attr('fb-xfbml-state')) {
                    FB.XFBML.parse();
                }
            }
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/wp-widget-loftocean-widget-posts.default', function ($scope) {
            if ($body.hasClass('elementor-editor-active')) {
                $scope.find('[data-show-list-number="on"]').length ? $scope.addClass('with-post-number') : $scope.removeClass('with-post-number');
            }
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/wp-widget-loftocean-widget-instagram.default', function ($scope) {
            if ($body.hasClass('elementor-editor-active') && $scope.find('.elementor-instagram-settings').length) {
                $scope.addClass($scope.find('.elementor-instagram-settings').data('columns'));
            }
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/cs_rounded_image.default', function ($scope) {
            var $gallery = $scope.find('.cs-gallery.gallery-carousel .cs-gallery-wrap');
            if ($gallery.length) {
                $gallery.slick({
                    dots: true,
                    arrows: false,
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    infinite: true,
                    speed: 500,
                    autoplay: true,
                    autoplaySpeed: 4000,
                    pauseOnHover: false
                });
            }
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/cs_testimonials.default', function ($scope) {
            var $slider = $scope.find('.testimonials-slider');
            if ($slider.length) {
                var column = $slider.data('column'), sliderResponsiveArgs = [{
                    breakpoint: 1024,
                    settings: { slidesToShow: 3 }
                }, {
                    breakpoint: 768,
                    settings: { slidesToShow: 2 }
                }, {
                    breakpoint: 480,
                    settings: { slidesToShow: 1 }
                }], sliderArgs = {
                    dots: 'on' == $slider.data('show-dots'),
                    arrows: 'on' == $slider.data('show-arrows'),
                    slidesToShow: column,
                    slidesToScroll: 1,
                    infinite: true,
                    speed: 500,
                    autoplay: 'on' == $slider.data('autoplay'),
                    autoplaySpeed: $slider.data('autoplay-speed'),
                    pauseOnHover: false,
                    responsive: column < 3 ? sliderResponsiveArgs.slice(- column) : sliderResponsiveArgs
                };
                if (1 == column) {
                    sliderArgs['fade'] = true;
                }
                $slider.find('.cs-ts-wrap').slick(sliderArgs);
            }
        });

        elementorFrontend.hooks.addAction('frontend/element_ready/cs_blog.default', function ($scope) {
            if ($body.hasClass('elementor-editor-active')) {
                var $masonry = $scope.find('.posts.layout-masonry'), $postGalleries = $scope.find('.post.format-gallery .thumbnail-gallery');
                if ($postGalleries.length) {
                    $postGalleries.each(function () {
                        $(this).cozystaySlickSlider({
                            dots: true,
                            arrows: true,
                            slidesToShow: 1,
                            slidesToScroll: 1,
                            infinite: true,
                            speed: 500,
                            autoplay: false,
                            autoplaySpeed: 5000,
                            appendArrows: $(this).parents('.featured-img').first().find('.slider-arrows'),
                            appendDots: $(this).parents('.featured-img').first().find('.slider-dots')
                        });
                    });
                }

                if ($masonry.length) {
                    $doc.trigger('cozystay.initMasonry', $masonry);
                }
            }
        });

        elementorFrontend.hooks.addAction('frontend/element_ready/cs_gallery.default', function ($scope) {
            var $gallery = $scope.find('.cs-gallery.gallery-carousel');
            if ($gallery.length) {
                var column = $gallery.data('column'), notOverflowStyle = ('on' != $gallery.data('overflow-style')), galleryResponsiveArgs = [{
                    breakpoint: 1024,
                    settings: { slidesToShow: 3 }
                }, {
                    breakpoint: 768,
                    settings: { slidesToShow: 2 }
                }, {
                    breakpoint: 480,
                    settings: { slidesToShow: 1 }
                }], sliderArgs = {
                    dots: 'on' == $gallery.data('show-dots'),
                    arrows: 'on' == $gallery.data('show-arrows'),
                    variableWidth: 'on' == $gallery.data('variable-width'),
                    centerMode: notOverflowStyle && ('on' == $gallery.data('center-mode')),
                    slidesToShow: column,
                    slidesToScroll: 1,
                    infinite: notOverflowStyle,
                    speed: 500,
                    autoplay: 'on' == $gallery.data('autoplay'),
                    autoplaySpeed: $gallery.data('autoplay-speed'),
                    pauseOnHover: false,
                    responsive: column < 3 ? galleryResponsiveArgs.slice(- column) : galleryResponsiveArgs
                };
                if (1 == column) {
                    sliderArgs['fade'] = ('on' == $gallery.data('fade'));
                }

                $gallery.find('.cs-gallery-wrap').slick(sliderArgs);
            }
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/cs_reservation.default', function ($scope) {
            var $reservationForm = $scope.find('.cs-form-wrap');
            if ($reservationForm.length) {
                registerReservationForm($reservationForm);
            }
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/cs_countdown.default', function ($scope) {
            var $countDwon = $scope.find('.cs-countdown-wrap');
            if ($countDwon.length) {
                var targetDate = getUTCTime($countDwon.data('end-date')), timerID = $scope.data('id');
                clearInterval(countDownTimers[timerID]);
                renderCountDownHTML($countDwon, getLeftTime(new Date().getTime(), targetDate), timerID);
                countDownTimers[timerID] = setInterval(function () {
                    renderCountDownHTML($countDwon, getLeftTime(new Date().getTime(), targetDate), timerID);
                }, 1000);
            }
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/cs_tabs.default', function ($scope) {
            var $titles = $scope.find('.cs-tabs .tab-title-link');
            if ($titles.length) {
                var $contents = $scope.find('.elementor-tabs-content-wrapper .elementor-tab-content');
                $titles.on('click', function (e) {
                    e.preventDefault();
                    var $self = $(this).parent();
                    if (!$self.hasClass('elementor-active')) {
                        $self.addClass('elementor-active').siblings().removeClass('elementor-active');
                        var $currentContent = $contents.addClass('hide').removeClass('elementor-active')
                            .filter($(this).attr('href'));
                        $currentContent.removeClass('hide').addClass('elementor-active');
                        $currentContent.find('.slick-slider.slick-initialized').length ? $currentContent.find('.slick-slider.slick-initialized').slick('refresh') : '';
                    }
                });
            }
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/cs_slider.default', function ($scope) {
            var $slider = $scope.find('.cs-slider');
            if ($slider.length) {
                var sliderCurrentClass = 'current-item';
                $slider.find('.cs-slider-item').removeClass('hide');
                $slider.find('.cs-slider-wrap').on('init', function (e, slick) {
                    var current = slick.slickCurrentSlide();
                    $(this).find('.cs-slider-item').filter('[data-slick-index=' + current + ']').addClass(sliderCurrentClass);
                }).on('afterChange', function (e, slick, currentSlide) {
                    var count = $(this).find('.cs-slider-item').length, prevSlide = (currentSlide - 1 + count) % count;
                    $(this).find('.cs-slider-item')
                        .removeClass(sliderCurrentClass)
                        .filter('[data-slick-index=' + currentSlide + ']').first().addClass(sliderCurrentClass);
                }).slick({
                    dots: 'on' == $slider.data('show-dots'),
                    arrows: 'on' == $slider.data('show-arrows'),
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    infinite: true,
                    speed: 500,
                    autoplay: 'on' == $slider.data('autoplay'),
                    autoplaySpeed: $slider.data('autoplay-speed') || 5000,
                    pauseOnHover: false,
                    fade: true
                });
            }
        });
        elementorFrontend.hooks.addAction('frontend/element_ready/cs_rooms.default', function ($scope) {
            var $slider = $scope.find('.cs-rooms-carousel');
            if ($slider.length) {
                var isCenterMode = $slider.hasClass('carousel-center-mode'), showDots = ('on' == $slider.data('show-dots')),
                    showArrows = ('on' == $slider.data('show-arrows')), childLength = $slider.find('.cs-room-item').length,
                    sliderArgs = {
                        dots: false,
                        arrows: false,
                        slidesToShow: $slider.data('column'),
                        slidesToScroll: 1,
                        infinite: true,
                        speed: 500,
                        autoplay: 'on' == $slider.data('autoplay'),
                        autoplaySpeed: $slider.data('autoplay-speed') || 5000,
                        centerMode: isCenterMode,
                        variableWidth: isCenterMode
                    };
                if (isCenterMode) {
                    sliderArgs['responsive'] = [{
                        breakpoint: 768,
                        settings: {
                            dots: true,
                            centerMode: false,
                            variableWidth: false
                        }
                    }];
                } else {
                    sliderArgs['responsive'] = [{
                        breakpoint: 768,
                        settings: {
                            slidesToShow: 1,
                            dots: true
                        }
                    }];
                    if ('3' == $slider.data('column')) {
                        sliderArgs['responsive'].push({
                            breakpoint: 1024,
                            settings: {
                                slidesToShow: 2,
                                dots: true
                            }
                        });
                    }
                }

                if (showArrows) {
                    $slider.append($('<div>', { 'class': 'slider-arrows' }));
                    sliderArgs['appendArrows'] = $slider.children('.slider-arrows');
                    sliderArgs['arrows'] = true;
                }
                if (showDots) {
                    $slider.append($('<div>', { 'class': 'slider-dots' }));
                    sliderArgs['appendDots'] = $slider.children('.slider-dots');
                    if ($slider.data('column') < childLength) {
                        sliderArgs['dots'] = true;
                    }
                }

                $slider.find('.cs-rooms-wrapper').on('init', function (e) {
                    $(this).find('.hide').removeClass('hide');
                    $.fn.loftoceanImageLoading ? $(this).loftoceanImageLoading() : '';
                }).slick(sliderArgs);
            }

            if ($body.hasClass('elementor-editor-active')) {
                var $gallery = $scope.find('.cs-room-item.has-post-thumbnail.format-gallery .thumbnail-gallery');
                if ($gallery.length) {
                    $gallery.each(function () {
                        $(this).cozystaySlickSlider({
                            dots: true,
                            arrows: true,
                            slidesToShow: 1,
                            slidesToScroll: 1,
                            infinite: true,
                            speed: 500,
                            autoplay: false,
                            autoplaySpeed: 5000,
                            appendArrows: $(this).parents('.featured-img').first().find('.slider-arrows'),
                            appendDots: $(this).parents('.featured-img').first().find('.slider-dots')
                        });
                    });
                }
            }
        });

        if (!$body.hasClass('elementor-editor-active')) {
            var currentHash = window.location.hash ? window.location.hash : false, enableAutoScroll = true,
                currentSearch = window.location.search ? new URLSearchParams(window.location.search) : false;
            if (currentSearch) {
                enableAutoScroll = currentSearch.get('disable-auto-scroll') ? false : true;
            }
            currentHash = currentHash ? currentHash.substr(1) : false;
            if (enableAutoScroll && currentHash) {
                var $tabTitle = $('.cs-tabs .elementor-tab-title a[data-id="' + currentHash + '"]');
                if ($tabTitle && $tabTitle.length) {
                    setTimeout(function () {
                        $tabTitle.trigger('click');
                        if ($tabTitle.data('auto-scroll') && ('on' == $tabTitle.data('auto-scroll'))) {
                            $('html, body').animate({ scrollTop: $tabTitle.offset().top - 50 }, 200);
                        }
                    }, 100);
                }
            }
        }
    });
})(jQuery);
