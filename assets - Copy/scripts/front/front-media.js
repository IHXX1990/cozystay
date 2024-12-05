( function( $ ) {
	"use strict";
	var is_retina = ( 'devicePixelRatio' in window ) && ( parseInt( window.devicePixelRatio, 10 ) >= 2 ),
		imageDataName = is_retina ? 'data-loftocean-retina-image' : 'data-loftocean-normal-image', isRTL = $( 'body' ).hasClass( 'rtl' ),
		$backgroundImages = false, $responsiveImgs = false, $head = $( 'head' ), previousTop = 0, lazyLoadDelta = 100;

	// Replace images if needed
	$.fn.loftoceanImageLoading = function() {
		var $bgImages = $( this ).add( $( this ).find( '[data-loftocean-image=1]' ) ).filter( '[data-loftocean-image=1]' ),
			$imgs = $( this ).add( $( this ).find( 'img[data-loftocean-loading-image="on"]' ) ).filter( 'img[data-loftocean-loading-image="on"]' );
		if ( loftoceanImageLoad.lazyLoadEnabled ) {
			if ( $bgImages.length ) {
				$backgroundImages = $backgroundImages && $backgroundImages.length ? $backgroundImages.add( $bgImages ) : $bgImages;
			}
			if ( $imgs.length ) {
				$responsiveImgs = $responsiveImgs && $responsiveImgs.length ? $responsiveImgs.add( $imgs ) : $imgs;
			}
			$( window ).trigger( 'startLazyLoad.loftocean' );
		} else {
			if ( $bgImages.length ) {
				$bgImages.each( function() {
					var self = $( this );
					if ( self.attr( 'data-loftocean-image' ) ) {
						var name = self.prop( 'tagName' ), image = self.attr( imageDataName );
						$( new Image() ).on( 'load', function() {
							self.css( 'transition', 'none' );
							( 'IMG' == name ) ? self.attr( 'src', image ).removeAttr( 'style' ) : self.css( { 'background-image': 'url(' + image + ')', 'filter': '' } );
							self.css( 'transition', '' );
							self.removeAttr( 'data-loftocean-retina-image' ).removeAttr( 'data-loftocean-normal-image' ).removeAttr( 'data-loftocean-image' );
						} ).attr( 'src', image );
					}
				} );
			}

			if ( $imgs.length ) {
				$imgs.each( function() {
					if ( $( this ).attr( 'data-loftocean-loading-image' ) ) {
					   $( this ).data( 'srcset' ) ? $( this ).attr( 'srcset', $( this ).data( 'srcset' ) ).removeAttr( 'data-srcset' ) : '';
					   $( this ).data( 'loftocean-lazy-load-sizes' ) ? $( this ).attr( 'sizes', $( this ).data( 'loftocean-lazy-load-sizes' ) ).removeAttr( 'data-loftocean-lazy-load-sizes' ) : '';
   					   $( this ).data( 'src' ) ? $( this ).attr( 'src', $( this ).data( 'src' ) ).removeAttr( 'data-src' ) : '';
					   $( this ).removeAttr( 'data-loftocean-loading-image' ).css( { 'filter': '', 'opacity': '' } );
				   }
				} );
			}
		}
		return this;
	};

	if ( loftoceanImageLoad.lazyLoadEnabled ) {
		$( window ).on( 'startLazyLoad.loftocean', function( e) {
			var scrollBottom = $( window ).scrollTop() + $( window ).height(), $done = $();
			if ( $backgroundImages && $backgroundImages.length ) {
				$backgroundImages.each( function() {
					var self = $( this ), image = self.attr( imageDataName );
					if ( image && ( parseInt( self.offset().top - scrollBottom, 10 ) < lazyLoadDelta ) ) {
						$( new Image() ).on( 'load', function() {
							self.css( 'transition', 'none' );
							self.css( { 'background-image': 'url(' + image + ')', 'filter': '' } );
							self.css( 'transition', '' );
							self.removeAttr( 'data-loftocean-retina-image' ).removeAttr( 'data-loftocean-normal-image' ).removeAttr( 'data-loftocean-image' );
						} ).attr( 'src', image );
						$done = $done.add( self );
					}
				} );
				if ( $done.length ) {
					$backgroundImages = $backgroundImages.not( $done );
				}
			}
			if ( $responsiveImgs && $responsiveImgs.length ) {
				$done = $();
				$responsiveImgs.each( function() {
					if ( $( this ).attr( 'data-loftocean-loading-image' ) && ( parseInt( $( this ).offset().top - scrollBottom, 10 ) < lazyLoadDelta ) ) {
						$( this ).data( 'srcset' ) ? $( this ).attr( 'srcset', $( this ).data( 'srcset' ) ).removeAttr( 'data-srcset' ) : '';
						$( this ).data( 'loftocean-lazy-load-sizes' ) ? $( this ).attr( 'sizes', $( this ).data( 'loftocean-lazy-load-sizes' ) ).removeAttr( 'data-loftocean-lazy-load-sizes' ) : '';
						$( this ).data( 'src' ) ? $( this ).attr( 'src', $( this ).data( 'src' ) ).removeAttr( 'data-src' ) : '';
						$( this ).removeAttr( 'data-loftocean-loading-image' ).css( { 'filter': '', 'opacity': '' } );
						$done = $done.add( $( this ) );
					}
				} );
				if ( $done.length ) {
					$responsiveImgs = $responsiveImgs.not( $done );
				}
			}
		} )
		.on( 'scroll', function( e ) {
			var scrollTop = $( this ).scrollTop();
			previousTop < scrollTop ? $( this ).trigger( 'startLazyLoad.loftocean' ) : '';
			previousTop = scrollTop;
		} ).on( 'load', function( e ) {
			$( this ).trigger( 'startLazyLoad.loftocean' );
		} );
		$( 'body *' ).on( 'scroll', function() {
			$( window ).trigger( 'startLazyLoad.loftocean' );
		} );
	}

	document.addEventListener( 'DOMContentLoaded', function() {
		$( 'body' ).loftoceanImageLoading();
		$( 'body' ).on( 'click', '#page .loftocean-gallery-zoom', function( e ) {
			e.preventDefault();
			var $body 	= $( 'body' ),
				$wrap 	= $( this ).parent(),
				$slick 	= $wrap.children( '.image-gallery' ).first();
			if ( $body.hasClass( 'gallery-zoom' ) ) {
				$body.removeClass( 'gallery-zoom' );
				$wrap.removeClass( 'fullscreen' );
			} else {
				$body.addClass( 'gallery-zoom' );
				$wrap.addClass( 'fullscreen' );
			}
			$slick.slick( 'slickSetOption', 'speed', 500, true );
		} )
		.on( 'click', '.post-content-gallery.justified-gallery-initialized .gallery-item, .portfolio-gallery.gallery-justified .gallery-item', function( e ) {
			e.preventDefault();
			var gallery_id = $( this ).closest( '.justified-gallery-initialized' ).data( 'gallery-id' );
			if ( gallery_id && $( '.loftocean-popup-sliders .' + gallery_id ).length ) {
				var $body = $( 'body' ), index = $( this ).index(),
					$wrap = $( '.loftocean-popup-sliders .' + gallery_id ),
					$slick = $wrap.children( '.image-gallery' ).first();
				if ( ! $body.hasClass( 'gallery-zoom' ) ) {
					$body.addClass( 'gallery-zoom' );
					$wrap.addClass( 'fullscreen' ).removeClass( 'hide' );
					$slick.slick( 'slickGoTo', index ).slick( 'slickSetOption', 'speed', 500, true );
				}
			}
		} )
		.on( 'click', '.loftocean-popup-sliders .loftocean-popup-gallery-close', function( e ) {
			e.preventDefault();
			var $body = $( 'body' ), $wrap = $( this ).parent();
			if ( $body.hasClass( 'gallery-zoom' ) ) {
				$body.removeClass( 'gallery-zoom' );
				$wrap.removeClass( 'fullscreen' ).addClass( 'hide' );
			}
		} )
		.on( 'click', '#secondary .cs-form-wrap .has-dropdown', function( e ) {
			e.preventDefault();
			e.stopImmediatePropagation();
			var $dropdown = $( this ).siblings( '.csf-dropdown' );
			if ( $dropdown.length ) {
				if ( $dropdown.hasClass( 'is-open' ) ) {
					$dropdown.removeClass( 'is-open' );
				} else {
					$( '.csf-dropdown' ).removeClass( 'is-open' );
					$dropdown.addClass( 'is-open' );
				}
			}
		} )
		.on( 'click', '#secondary .cs-form-wrap .minus', function( e ) {
            e.preventDefault();

            if ( 'on' == $( this ).data( 'disabled' ) ) return '';

            var $self = $( this ), $buttonWrapper = $self.parent(), label = $buttonWrapper.data( 'label' ),
                $outerInput = $self.parents( '.field-wrap' ).first().find( '.field-input-wrap input' ), hasLabel = loftoceanImageLoad[ 'reservation' ][ label ],
                $innerInput = $self.siblings( 'input' ).first(), currentValue = parseInt( $innerInput.val(), 10 ), minValue = $innerInput.data( 'min' ),
                regexString = hasLabel ? ( new RegExp( '\\d+ (' + loftoceanImageLoad[ 'reservation' ][ label ][ 'plural' ] + '|' + loftoceanImageLoad[ 'reservation' ][ label ]['single'] + ')', 'ig' ) ) : false;

            if ( ( ! $innerInput.length ) || ( ! $outerInput.length ) ) return '';

            var outerInputValue = $outerInput.val() || '';

			minValue = ( 'undefined' == typeof minValue ) || isNaN( minValue ) || ( minValue < 1 ) ? 0 : minValue;

            currentValue = isNaN( currentValue ) ? 1 : currentValue;
            currentValue = Math.max( ( currentValue < 1 ? 0 : ( currentValue - 1 ) ), minValue );
            $innerInput.val( currentValue );

            if ( $outerInput.hasClass( 'separated-guests' ) ) {
                outerInputValue = currentValue;
            } else {
                if ( hasLabel && regexString.test( outerInputValue ) ) {
                    outerInputValue = outerInputValue.replace( regexString, currentValue + ' ' + loftoceanImageLoad[ 'reservation' ][ label ][ ( currentValue < 2 ) ? 'single' : 'plural' ] )
                } else {
                    var extraValue = currentValue;
					if ( hasLabel ) {
						extraValue += ' ' + loftoceanImageLoad[ 'reservation' ][ label ][ ( currentValue < 2 ) ? 'single' : 'plural' ];
	                    outerInputValue = ( 'adult' == label ) ? extraValue + ', ' + outerInputValue : outerInputValue + ', ' + extraValue;
					} else {
						outerInputValue = extraValue;
					}
                }
            }
            $outerInput.val( outerInputValue );
            $self.siblings( '.plus' ).removeClass( 'disabled' ).data( 'disabled', '' ).removeAttr( 'disabled' );
            minValue === currentValue ? $self.data( 'disabled', 'on' ).addClass( 'disabled' ).attr( 'disabled', 'disabled' ) : '';
        } )
		.on( 'click', '#secondary .cs-form-wrap .plus', function( e ) {
            e.preventDefault();

            if ( 'on' == $( this ).data( 'disabled' ) ) return '';

            var $self = $( this ), $buttonWrapper = $self.parent(), label = $buttonWrapper.data( 'label' ),
                $outerInput = $self.parents( '.field-wrap' ).first().find( '.field-input-wrap input' ), hasLabel = loftoceanImageLoad[ 'reservation' ][ label ],
                $innerInput = $self.siblings( 'input' ).first(), currentValue = parseInt( $innerInput.val(), 10 ), maxValue = $innerInput.data( 'max' ),
                regexString = hasLabel ? ( new RegExp( '\\d+ (' + loftoceanImageLoad[ 'reservation' ][ label ][ 'plural' ] + '|' + loftoceanImageLoad[ 'reservation' ][ label ][ 'single' ] + ')', 'ig' ) ) : false;

            if ( ( ! $innerInput.length ) || ( ! $outerInput.length ) ) return '';

            var outerInputValue = $outerInput.val() || '';

            currentValue = isNaN( currentValue ) ? 1 : currentValue;
            currentValue = currentValue < 1 ? 1 : ( currentValue + 1 );
			if ( ( 'undefined' != typeof maxValue ) && ( ! isNaN( maxValue ) ) ) {
				currentValue = Math.min( maxValue, currentValue );
			}
            $innerInput.val( currentValue );
            if ( $outerInput.hasClass( 'separated-guests' ) ) {
                outerInputValue = currentValue;
            } else {
                if ( hasLabel && regexString.test( outerInputValue ) ) {
                    outerInputValue = outerInputValue.replace( regexString, currentValue + ' ' + loftoceanImageLoad[ 'reservation' ][ label ][ ( currentValue < 2 ) ? 'single' : 'plural' ] )
                } else {
                    var extraValue = currentValue;
					if ( hasLabel ) {
						extraValue += ' ' + loftoceanImageLoad[ 'reservation' ][ label ][ ( currentValue < 2 ) ? 'single' : 'plural' ];
	                    outerInputValue = ( 'adult' == label ) ? extraValue + ', ' + outerInputValue : outerInputValue + ', ' + extraValue;
					} else {
						outerInputValue = extraValue;
					}
                }
            }
            $outerInput.val( outerInputValue );
            $self.siblings( '.minus' ).removeClass( 'disabled' ).removeAttr( 'disabled' ).data( 'disabled', '' );
        } );

		var $roomSearchForm = $( '#secondary .cs-form-wrap' );
		if ( $roomSearchForm.length ) {
			var dateFormat = $roomSearchForm.data( 'date-format' ) ? $roomSearchForm.data( 'date-format' ) : 'YYYY-MM-DD',
				$checkinDate = $roomSearchForm.find( '.checkin-date input[name="checkin"]' ), $checkoutDate = $roomSearchForm.find( '.checkout-date input' ),
				$dateRangePicker = $roomSearchForm.find( '.date-range-picker' );
			$dateRangePicker.daterangepicker( {
				minDate: moment().format( dateFormat ),
				startDate: $checkinDate.val(),
				endDate: $checkoutDate.val(),
				locale: { format: dateFormat },
				autoApply: true
			} ).on( 'apply.daterangepicker', function( e, drp ) {
				var startDate = drp.startDate.format( dateFormat ), endDate = drp.endDate.format( dateFormat );
				$( this ).val( startDate + ' - ' + endDate );
				$checkinDate.val( startDate );
				$checkoutDate.val( endDate );
			} );
			$roomSearchForm.find( '.checkin-date, .checkout-date' ).on( 'click', function( e ) {
				var dateRangePicker = $dateRangePicker.data( 'daterangepicker' );
				dateRangePicker.setStartDate( $checkinDate.val() );
				dateRangePicker.setEndDate( $checkoutDate.val() );
				dateRangePicker.show();
			} );
		}

		var $carousels = $( '.posts.layout-carousel .posts-wrapper' );
		if ( $carousels.length ) {
			var responsiveSettings = [
				{
					'breakpoint': 1200,
					'settings': {
						'slidesToShow': 3
					}
				},
				{
					'breakpoint': 800,
					'settings': {
						'slidesToShow': 2
					}
				},
				{
					'breakpoint': 480,
					'settings': {
						'slidesToShow': 1
					}
				}
			];
			$carousels.each( function() {
				var $wrap = $( this ).parent(), cols = $wrap.find( '.post' ).length;
				cols = Math.min( Math.max( parseInt( cols, 10 ), 1 ), 4 );
				$( this ).on( 'init', function( e ) {
					$.fn.loftoceanImageLoading ? $( this ).loftoceanImageLoading() : '';
				} ).slick( {
					'dots': false,
					'arrows': true,
					'infinite': true,
					'fade': false,
					'speed': 700,
					'autoplay': true,
					'autoplaySpeed': 5000,
					'pauseOnHover': true,
					'rtl': isRTL,
					'slidesToShow': cols,
					'slidesToScroll': 1,
					'swipeToSlide': true,
					'responsive': responsiveSettings.slice( -cols )
				} );
			} );
		}

		var $roomCarousel = $( '.room-top-section .cs-gallery.gallery-carousel.variable-width .cs-gallery-wrap' );
		if ( $roomCarousel.length ) {
			$roomCarousel.each( function() {
				$( this ).on( 'init', function( e ) {
                    $( this ).find( '.hide' ).removeClass( 'hide' );
				} ).slick( {
		            dots: true,
		            arrows: true,
		            slidesToShow: 1,
		            infinite: true,
		            speed: 500,
		            centerMode: true,
		            variableWidth: true
		        } );
			} );
		}

		var $roomTopGallery = $( '.room-top-section .cs-gallery.gallery-mosaic .cs-gallery-item > a' );
		if ( $roomTopGallery.length ) {
			new SimpleLightbox( '.room-top-section .cs-gallery.gallery-mosaic .cs-gallery-item > a', {} );
			$( '.room-top-section .cs-gallery-view-all' ).on( 'click', function( e ) {
				e.preventDefault();
				$roomTopGallery.eq( 0 ).find( 'img' ).trigger( 'click' );
			} );
		}
	} );
} ) ( jQuery );
