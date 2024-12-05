<?php
namespace LoftOcean\Room\Settings;

if ( ! class_exists( '\LoftOcean\Room\Settings\Price' ) ) {
	class Price {
		/**
		* Construct function
		*/
		public function __construct() {
			add_action( 'loftocean_room_the_settings_tabs', array( $this, 'get_room_setting_tabs' ) );
			add_action( 'loftocean_room_the_settings_panel', array( $this, 'the_room_setting_panel' ) );
			add_action( 'loftocean_save_room_settings', array( $this, 'save_room_settings' ) );
		}
		/**
		* Tab titles
		*/
		public function get_room_setting_tabs( $pid ) { ?>
			<li class="loftocean-room room-options tab-price">
				<a href="#tab-price"><span><?php esc_html_e( 'Price & Capacity', 'loftocean' ); ?></span></a>
			</li><?php
		}
		/**
		* Tab panel
		*/
		public function the_room_setting_panel( $pid ) {
			$data = $this->get_room_data( $pid );
			$enable_price_by_people = ( 'on' == $data[ 'room_price_by_people' ] );
			$enable_weekend_prices = ( 'on' == $data[ 'room_enable_weekend_prices' ] ); ?>

			<div id="tab-price-panel" class="panel loftocean-room-setting-panel hidden">
				<div class="options-group">
					<p class="form-field number-field">
						<label for="room_regular_price"><?php esc_html_e( 'Regular Price (Per Night)', 'loftocean' ); ?></label>
						<input name="loftocean_room_regular_price" id="room_regular_price" value="<?php echo esc_attr( $data['room_regular_price'] ); ?>" type="number" />
					</p>
					<p class="form-field number-field">
						<label for="room_min_people"><?php esc_html_e( 'Min People', 'loftocean' ); ?></label>
						<input name="loftocean_room_min_people" id="room_min_people" value="<?php echo esc_attr( $data['room_min_people'] ); ?>" type="number" />
					</p>
					<p class="form-field number-field">
						<label for="room_max_people"><?php esc_html_e( 'Max People', 'loftocean' ); ?></label>
						<input name="loftocean_room_max_people" id="room_max_people" value="<?php echo esc_attr( $data['room_max_people'] ); ?>" type="number" />
					</p>
					<p class="form-field checkbox-field">
						<label for="room_price_by_people"><?php esc_html_e( 'Occupancy Based?', 'loftocean' ); ?></label>
						<input name="loftocean_room_price_by_people" id="room_price_by_people" type="checkbox" value="on" <?php checked( $data[ 'room_price_by_people' ], 'on' ); ?> />
						<?php esc_html_e( 'Multiply all costs by person count', 'loftocean' ); ?>
					</p>
					<p class="form-field number-field price-by-people-unit"<?php if ( ! $enable_price_by_people ) : ?> style="display: none;"<?php endif; ?>>
						<label for="room_price_per_adult"><?php esc_html_e( 'Adult Price (Per Person)', 'loftocean' ); ?></label>
						<input name="loftocean_room_price_per_adult" id="room_price_per_adult" value="<?php echo esc_attr( $data['room_price_per_adult'] ); ?>" type="number" />
					</p>
					<p class="form-field number-field price-by-people-unit"<?php if ( ! $enable_price_by_people ) : ?> style="display: none;"<?php endif; ?>>
						<label for="room_price_per_child"><?php esc_html_e( 'Children Price (Per Person)', 'loftocean' ); ?></label>
						<input name="loftocean_room_price_per_child" id="room_price_per_child" value="<?php echo esc_attr( $data['room_price_per_child'] ); ?>" type="number" />
					</p>
					<p class="form-field checkbox-field">
						<label for="room_enable_weekend_prices"><?php esc_html_e( 'Set Weekend Pricing', 'loftocean' ); ?></label>
						<input name="loftocean_room_enable_weekend_prices" id="room_enable_weekend_prices" type="checkbox" value="on" <?php checked( $data[ 'room_enable_weekend_prices' ], 'on' ); ?> />
						<?php esc_html_e( 'This will replace the base price for every Friday and Saturday.', 'loftocean' ); ?>
					</p>
					<p class="form-field number-field weekend-prices"<?php if ( ! $enable_weekend_prices ) : ?> style="display: none;"<?php endif; ?>>
						<label for="room_weekend_price_per_night"><?php esc_html_e( 'Weekend Price - Per Night ', 'loftocean' ); ?></label>
						<input name="loftocean_room_weekend_price_per_night" id="room_weekend_price_per_night" value="<?php echo esc_attr( $data['room_weekend_price_per_night'] ); ?>" type="number" />
					</p>
					<p class="form-field number-field weekend-prices"<?php if ( ! $enable_weekend_prices ) : ?> style="display: none;"<?php endif; ?>>
						<label for="room_weekend_price_per_adult"><?php esc_html_e( 'Weekend Price - Per Adult', 'loftocean' ); ?></label>
						<input name="loftocean_room_weekend_price_per_adult" id="room_weekend_price_per_adult" value="<?php echo esc_attr( $data['room_weekend_price_per_adult'] ); ?>" type="number" />
					</p>
					<p class="form-field number-field weekend-prices"<?php if ( ! $enable_weekend_prices ) : ?> style="display: none;"<?php endif; ?>>
						<label for="room_weekend_price_per_child"><?php esc_html_e( 'Weekend Price - Per Child', 'loftocean' ); ?></label>
						<input name="loftocean_room_weekend_price_per_child" id="room_weekend_price_per_child" value="<?php echo esc_attr( $data['room_weekend_price_per_child'] ); ?>" type="number" />
					</p>
				</div>
			</div><?php
		}
		/**
		* Get room data
		*/
		protected function get_room_data( $pid ) {
			return array(
				'room_regular_price' => get_post_meta( $pid, 'loftocean_room_regular_price', true ),
				'room_min_people' => get_post_meta( $pid, 'loftocean_room_min_people', true ),
				'room_max_people' => get_post_meta( $pid, 'loftocean_room_max_people', true ),
				'room_price_by_people' => get_post_meta( $pid, 'loftocean_room_price_by_people', true ),
				'room_price_per_adult' => get_post_meta( $pid, 'loftocean_room_price_per_adult', true ),
				'room_price_per_child' => get_post_meta( $pid, 'loftocean_room_price_per_child', true ),
				'room_enable_weekend_prices' => get_post_meta( $pid, 'loftocean_room_enable_weekend_prices', true ),
				'room_weekend_price_per_night' => get_post_meta( $pid, 'loftocean_room_weekend_price_per_night', true ),
				'room_weekend_price_per_adult' => get_post_meta( $pid, 'loftocean_room_weekend_price_per_adult', true ),
				'room_weekend_price_per_child' => get_post_meta( $pid, 'loftocean_room_weekend_price_per_child', true )
			);
		}
		/**
		* Save room settings
		*/
		public function save_room_settings( $pid ) {
			$regular_price = sanitize_text_field( wp_unslash( $_REQUEST[ 'loftocean_room_regular_price' ] ) );
			$min_people = sanitize_text_field( wp_unslash( $_REQUEST[ 'loftocean_room_min_people' ] ) );
			$max_people = sanitize_text_field( wp_unslash( $_REQUEST[ 'loftocean_room_max_people' ] ) );
			$price_by_people = empty( $_REQUEST[ 'loftocean_room_price_by_people' ] ) ? '' : 'on';
			$price_per_adult = sanitize_text_field( wp_unslash( $_REQUEST[ 'loftocean_room_price_per_adult' ] ) );
			$price_per_child = sanitize_text_field( wp_unslash( $_REQUEST[ 'loftocean_room_price_per_child' ] ) );

			$enable_weekend_prices = empty( $_REQUEST[ 'loftocean_room_enable_weekend_prices' ] ) ? '' : 'on';
			$weekend_price_per_night = sanitize_text_field( wp_unslash( $_REQUEST[ 'loftocean_room_weekend_price_per_night' ] ) );
			$weekend_price_per_adult = sanitize_text_field( wp_unslash( $_REQUEST[ 'loftocean_room_weekend_price_per_adult' ] ) );
			$weekend_price_per_child = sanitize_text_field( wp_unslash( $_REQUEST[ 'loftocean_room_weekend_price_per_child' ] ) );

			update_post_meta( $pid, 'loftocean_room_regular_price', $regular_price );
			update_post_meta( $pid, 'loftocean_room_min_people', $min_people );
			update_post_meta( $pid, 'loftocean_room_max_people', $max_people );
			update_post_meta( $pid, 'loftocean_room_price_by_people', $price_by_people );
			update_post_meta( $pid, 'loftocean_room_price_per_adult', $price_per_adult );
			update_post_meta( $pid, 'loftocean_room_price_per_child', $price_per_child );

			update_post_meta( $pid, 'loftocean_room_enable_weekend_prices', $enable_weekend_prices );
			update_post_meta( $pid, 'loftocean_room_weekend_price_per_night', $weekend_price_per_night );
			update_post_meta( $pid, 'loftocean_room_weekend_price_per_adult', $weekend_price_per_adult );
			update_post_meta( $pid, 'loftocean_room_weekend_price_per_child', $weekend_price_per_child );
		}
	}
	new Price();
}
