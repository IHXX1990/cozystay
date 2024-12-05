<?php
/**
* Template for rooms search result page
*/
$room_search_vars = apply_filters( 'loftocean_room_search_vars', array() );
$hide_fields = apply_filters( 'loftocean_room_reservation_form_hide_fields', array() ); 
$hide_room = isset( $hide_fields, $hide_fields[ 'room' ] ) && ( ! empty( $hide_fields[ 'room' ] ) );
$hide_adult = isset( $hide_fields, $hide_fields[ 'adult' ] ) && ( ! empty( $hide_fields[ 'adult' ] ) );
$hide_children = isset( $hide_fields, $hide_fields[ 'child' ] ) && ( ! empty( $hide_fields[ 'child' ] ) );
get_header();
get_template_part( 'template-parts/page-header/room-search' ); ?>

<div class="main">
    <div class="container">
        <div id="primary" class="primary content-area"><?php
        if ( have_posts() ) :
            do_action( 'loftocean_rooms_widget_the_list_content', array(
                'args' => array( 'layout' => 'list', 'columns' => '', 'metas' => array( 'excerpt', 'read_more_btn', 'subtitle', 'label' ), 'page_layout' => '' ),
                'wrap_class' => array( 'posts', 'cs-rooms', 'layout-list', 'img-ratio-3-2' ),
                'pagination' => 'link-number'
            ), false );
        else : ?>
            <div class="no-room-found">
                <p class="no-room-found-error-message"><?php esc_html_e( 'Sorry, we currently don\'t have any rooms that match your search. Please try changing the search parameters and searching again.', 'loftocean' ); ?></p>
            </div><?php
        endif;
        wp_reset_query(); ?>
        </div>

        <aside id="secondary" class="sidebar">
            <div class="sidebar-container">
                <div class="cs-reservation-form style-block cs-form-square inline-label">
                    <form class="cs-form-wrap" data-date-format="<?php esc_attr_e( 'YYYY-MM-DD' ); ?>" action="<?php echo esc_url( home_url( '/' ) ); ?>" method="GET"><?php
                        $checkin_date = isset( $room_search_vars[ 'checkin' ] ) ? $room_search_vars[ 'checkin' ] : date( esc_html__( 'Y-m-d', 'loftocean' ) );
                        $checkout_date = isset( $room_search_vars[ 'checkout' ] ) ? $room_search_vars[ 'checkout' ] : date( esc_html__( 'Y-m-d', 'loftocean' ), strtotime( 'tomorrow' ) ); ?>
                        <div class="cs-form-field cs-check-in">
                            <div class="field-wrap">
                                <label class="cs-form-label"><?php esc_html_e( 'Check In', 'loftocean' ); ?></label>

                                <div class="field-input-wrap checkin-date">
                                    <input type="text" class="date-range-picker" value="<?php echo $checkin_date; ?> - <?php echo $checkout_date; ?>">
                                    <input type="hidden" value="<?php echo $checkin_date; ?>" name="checkin" readonly>
                                    <input type="text" class="check-in-date-show" placeholder="" value="" readonly>
                                </div>
                            </div>
                        </div>

                        <div class="cs-form-field cs-check-out">
                            <div class="field-wrap">
                                <label class="cs-form-label"><?php esc_html_e( 'Check Out', 'loftocean' ); ?></label>

                                <div class="field-input-wrap checkout-date">
                                    <input type="hidden" value="<?php echo $checkout_date; ?>" name="checkout" readonly>
                                    <input type="text" class="check-out-date-show" placeholder="" value="" readonly>
                                </div>
                            </div>
                        </div>

                        <div class="cs-form-field cs-rooms cs-has-dropdown<?php if ( $hide_room ) : ?> hide<?php endif; ?>">
                            <div class="field-wrap">
                                <label class="cs-form-label"><?php esc_html_e( 'Rooms', 'loftocean' ); ?></label>

                                <div class="field-input-wrap has-dropdown">
                                    <input type="text" name="rooms" value="<?php echo isset( $room_search_vars[ 'room_quantity_label' ] ) ? $room_search_vars[ 'room_quantity_label' ] : esc_html__( '1 Room', 'loftocean' ); ?>" readonly="">
                                </div>

                                <div class="csf-dropdown">
                                    <div class="csf-dropdown-item">
                                        <label class="cs-form-label"><?php esc_html_e( 'Rooms', 'loftocean' ); ?></label>

                                        <div class="quantity cs-quantity" data-label="room">
                                            <label class="screen-reader-text"><?php esc_html_e( 'Rooms quantity', 'loftocean' ); ?></label>
                                            <button class="minus"></button>
                                            <input type="text" name="room-quantity" value="<?php echo isset( $room_search_vars[ 'room-quantity' ] ) ? $room_search_vars[ 'room-quantity' ] : 1; ?>" class="input-text" autocomplete="off" readonly="" data-min="1" data-max="50">
                                            <button class="plus"></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="cs-form-field cs-guests cs-has-dropdown<?php if ( $hide_adult && $hide_children ) : ?> hide<?php endif; ?>">
                            <div class="field-wrap">
                                <label class="cs-form-label"><?php esc_html_e( 'Guests', 'loftocean' ); ?></label>

                                <div class="field-input-wrap has-dropdown"><?php
                                    $guest_label = array();
                                    if ( $hide_adult && $hide_children ) {
                                        $room_search_vars[ 'adult-quantity' ] = 0;
                                        $room_search_vars[ 'child-quantity' ] = 0;
                                        array_push( $guest_label, esc_html__( '0 Adult', 'loftocean' ) );
                                    } else {
                                        if ( $hide_adult ) {
                                            $room_search_vars[ 'adult-quantity' ] = 0;
                                        } else {
                                            if ( isset( $room_search_vars[ 'adult_quantity_label' ] ) && ( ! empty( $room_search_vars[ 'adult_quantity_label' ] ) ) ) {
                                                array_push( $guest_label, $room_search_vars[ 'adult_quantity_label' ] );
                                            } else if ( $hide_children ) {
                                                $room_search_vars[ 'adult-quantity' ] = 2;
                                                array_push( $guest_label, esc_html__( '2 Adults', 'loftocean' ) );
                                            }
                                        }
                                        if ( $hide_children ) {
                                            $room_search_vars[ 'child-quantity' ] = 0;
                                        } else {
                                            if ( isset( $room_search_vars[ 'child_quantity_label' ] ) && ( ! empty( $room_search_vars[ 'child_quantity_label' ] ) ) ) {
                                                array_push( $guest_label, $room_search_vars[ 'child_quantity_label' ] );
                                            } else if ( $hide_adult ) {
                                                $room_search_vars[ 'child-quantity' ] = 1;
                                                array_push( $guest_label, esc_html__( '1 Child', 'loftocean' ) );
                                            }
                                        }
                                        if ( ( ! $hide_adult ) && ( ! $hide_children ) && ( 0 === count( $guest_label ) ) ) {
                                            $room_search_vars[ 'child-quantity' ] = 0;
                                            $room_search_vars[ 'adult-quantity' ] = 2;
                                            array_push( $guest_label, esc_html__( '2 Adults', 'loftocean' ) );
                                        }
                                    } ?>
                                    <input type="text" name="guests" value="<?php echo implode( ', ', $guest_label ); ?>" readonly="">
                                </div>

                                <div class="csf-dropdown">
                                    <div class="csf-dropdown-item<?php if ( $hide_adult ) : ?> hide<?php endif; ?>">
                                        <label class="cs-form-label"><?php esc_html_e( 'Adults', 'loftocean' ); ?></label>

                                        <div class="quantity cs-quantity" data-label="adult">
                                            <label class="screen-reader-text"><?php esc_html_e( 'Adults quantity', 'loftocean' ); ?></label>
                                            <button class="minus"></button>
                                            <input type="text" name="adult-quantity" value="<?php echo $room_search_vars[ 'adult-quantity' ]; ?>" class="input-text" autocomplete="off" readonly="" data-min="1" data-max="50">
                                            <button class="plus"></button>
                                        </div>
                                    </div>

                                    <div class="csf-dropdown-item<?php if ( $hide_children ) : ?> hide<?php endif; ?>">
                                        <label class="cs-form-label"><?php esc_html_e( 'Children', 'loftocean' ); ?></label>

                                        <div class="quantity cs-quantity" data-label="child">
                                            <label class="screen-reader-text"><?php esc_html_e( 'Children quantity', 'loftocean' ); ?></label>
                                            <button class="minus"></button>
                                            <input type="text" name="child-quantity" value="<?php echo isset( $room_search_vars[ 'child-quantity' ] ) ? $room_search_vars[ 'child-quantity' ] : 0; ?>" class="input-text" autocomplete="off" readonly="" data-min="0" data-max="50">
                                            <button class="plus"></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="cs-form-field cs-submit">
                            <div class="field-wrap">
                                <button type="submit" class="button"><span class="btn-text"><?php esc_html_e( 'Check Availability', 'loftocean' ); ?></span></button>
                            </div>
                        </div>
        				<input type="hidden" name="search_rooms" value="" />
                        <?php do_action( 'loftocean_search_form' ); ?>
                    </form>
                </div>
            </div>
        </aside>

    </div>
</div><?php

get_footer();
