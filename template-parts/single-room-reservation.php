<?php if ( class_exists( 'WooCommerce', false ) ) :
    $show_adult_child = true;
    $hide_fields = apply_filters( 'loftocean_room_reservation_form_hide_fields', array_fill_keys( array( 'room', 'adult', 'child' ), false ) );
    $fields_classes = array( 'room' => array( 'cs-form-field', 'cs-rooms' ), 'adult' => array( 'cs-form-field', 'cs-adults' ), 'child' => array( 'cs-form-field', 'cs-children' ) );
    foreach( $hide_fields as $field => $hide ) {
        if ( $hide ) {
            array_push( $fields_classes[ $field ], 'hide' );
            if ( in_array( $field, array( 'adult', 'child' ) ) ) {
                $show_adult_child = false;
            }
        }
    }
    if ( $show_adult_child ) {
        array_push( $fields_classes[ 'adult' ], 'form-field-col-1-2' );
        array_push( $fields_classes[ 'child' ], 'form-field-col-1-2' );
    }
    $current_room_id = get_queried_object_id();
    $current_currency = \LoftOcean\get_current_currency(); ?>

    <div class="cs-room-booking loading">
        <div class="cs-room-booking-wrap">
            <div class="room-booking-title">
                <h4><?php esc_html_e( 'Reserve:', 'loftocean' ); ?></h4>
                <span><?php printf(
                    // translators: html tag
                    esc_html__( 'From %s/night', 'loftocean' ),
                    '<span class="base-price"></span>'
                ); ?></span>
            </div>

            <div class="room-booking-form">
                <div class="cs-reservation-form style-block cs-form-square inline-label">
                    <div class="cs-form-wrap">
                        <div class="cs-form-field cs-check-in">
                            <div class="field-wrap">
                                <label class="cs-form-label"><?php esc_html_e( 'Check In', 'loftocean' ); ?></label>

                                <div class="field-input-wrap checkin-date">
                                    <input type="text" class="date-range-picker" value="">
                                    <input type="hidden" value="" name="checkin" readonly>
                                  	<input type="text" class="check-in-date-show" placeholder="" value="" readonly>
                                </div>
                            </div>
                        </div>
                        <div class="cs-form-field cs-check-out">
                            <div class="field-wrap">
                                <label class="cs-form-label"><?php esc_html_e( 'Check Out', 'loftocean' ); ?></label>
                                <div class="field-input-wrap checkout-date">
                                    <input type="hidden" value="" name="checkout" readonly>
                                  	<input type="text" class="check-out-date-show" placeholder="" value="" readonly>
                                </div>
                            </div>
                        </div>

                        <div class="<?php echo esc_attr( implode( ' ', $fields_classes[ 'room' ] ) ); ?>">
                            <div class="field-wrap">
                                <label class="cs-form-label"><?php esc_html_e( 'Rooms', 'loftocean' ); ?></label>
                                <div class="field-input-wrap has-dropdown">
                                    <input type="text" name="rooms" value="<?php esc_attr_e( '1 Room', 'loftocean' ); ?>" readonly="">
                                </div>

                                <div class="csf-dropdown">
                                    <div class="csf-dropdown-item has-dropdown">
                                        <label class="cs-form-label"><?php esc_html_e( 'Rooms', 'loftocean' ); ?></label>
                                        <div class="quantity cs-quantity" data-label="room">
                                            <label class="screen-reader-text"><?php esc_html_e( 'Rooms quantity', 'loftocean' ); ?></label>
                                            <button class="minus"></button>
                                            <input type="text" name="room-quantity" value="1" class="input-text" autocomplete="off" readonly="" data-min="1">
                                            <button class="plus"></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="cs-form-notice">
                                <p><?php printf( esc_html__( 'Only %s Left', 'loftocean' ), '<span class="room-error-limit-number"></span>' ); ?></p>
                            </div>
                        </div>

                        <div class="<?php echo esc_attr( implode( ' ', $fields_classes[ 'adult' ] ) ); ?>">
                            <div class="field-wrap">
                                <label class="cs-form-label"><?php esc_html_e( 'Adults', 'loftocean' ); ?></label>
                                <div class="field-input-wrap has-dropdown">
                                    <input type="text" name="adults" value="1" readonly="">
                                </div>
                                <div class="csf-dropdown">
                                    <div class="csf-dropdown-item has-dropdown">
                                        <label class="cs-form-label"><?php esc_html_e( 'Adults', 'loftocean' ); ?></label>
                                        <div class="quantity cs-quantity">
                                            <label class="screen-reader-text"><?php esc_html_e( 'Adults quantity', 'loftocean' ); ?></label>
                                            <button class="minus"></button>
                                            <input type="text" name="adult-quantity" value="1" class="input-text" autocomplete="off" readonly="" data-min="1">
                                            <button class="plus"></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="<?php echo esc_attr( implode( ' ', $fields_classes[ 'child' ] ) ); ?>">
                            <div class="field-wrap">
                                <label class="cs-form-label"><?php esc_html_e( 'Children', 'loftocean' ); ?></label>
                                <div class="field-input-wrap has-dropdown">
                                    <input type="text" name="children" value="0" readonly="">
                                </div>
                                <div class="csf-dropdown">
                                    <div class="csf-dropdown-item has-dropdown">
                                        <label class="cs-form-label"><?php esc_html_e( 'Children', 'loftocean' ); ?></label>
                                        <div class="quantity cs-quantity">
                                            <label class="screen-reader-text"><?php esc_html_e( 'Children quantity', 'loftocean' ); ?></label>
                                            <button class="minus"></button>
                                            <input type="text" name="child-quantity" value="0" class="input-text" autocomplete="off" readonly="" data-min="0">
                                            <button class="plus"></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="cs-form-total-price">
                            <h5 class="csf-title">
                                <?php esc_html_e( 'Total Cost', 'loftocean' ); ?>
                                <span class="price-details">
                                    <span class="screen-reader-text"><?php esc_html_e( 'View Details', 'loftocean' ); ?></span>
                                </span>
                            </h5>
                            <div class="total-price"><?php echo $current_currency[ 'left' ]; ?><span class="total-price-number"></span><?php echo $current_currency[ 'right' ]; ?></div>
                        </div>
                        <div class="cs-form-price-details hide"></div>
                        <div class="cs-form-field cs-submit">
                            <div class="field-wrap">
                                <button type="submit" class="button cs-btn-color-black cs-btn-rounded"><span class="btn-text"><?php esc_html_e( 'Book Your Stay Now', 'loftocean' ); ?></span></button>
                            </div>
                        </div>
                    </div>
                    <div class="cs-form-error-message"></div>
                    <div class="cs-form-success-message"></div>
                </div>
            </div>
        </div>
    </div><?php
endif;
