<?php
namespace LoftOcean\Room;

if ( ! class_exists( '\LoftOcean\Room\Prices' ) ) {
	class Prices {
		/**
		* Room post type
		*/
		protected $room_post_type = 'loftocean_room';
		/**
		* Custom Price Table
		*/
		protected $custom_price_table = 'loftocean_room_custom_price';
		/*
		* Construction function
		*/
		public function __construct() { return false;
			if ( is_admin() ) {
				$this->check_tables();
			}
			add_action( 'rest_api_init', array( $this, 'register_rest_api' ) );
			add_filter( 'loftocean_get_room_prices', array( $this, 'get_prices' ), 99, 3 );
		}
		/*
		* Register REST APIs
		*/
		public function register_rest_api() {
			register_rest_route( 'loftocean/v1', '/update_room_custom_data/(?P<rid>.+)/(?P<data>.+)', array(
				'methods' 	=> 'GET',
				'permission_callback' => '__return_true',
				'callback' 	=> array( $this, 'update_room_custom_data' )
			) );
		}
		/**
		* REST API update room availability data
		*/
		public function update_room_custom_data( $data ) {
			$rid = wp_unslash( $data[ 'rid' ] );
			$d = wp_unslash( $data[ 'data' ] );
			if ( ( ! empty( $rid ) ) && ( ! empty( $d ) ) ) {
				$d = base64_decode( $d );
				$d = json_decode( $d, true );
				if ( ! empty( $d ) ) {
					foreach( $d as $row ) {
						$this->update_room_data( $rid, $row );
					}
				}
			}
			return array( 'updated' => true );
		}
		/**
		* Update room custom data: price, status, room number
		*/
		public function update_room_data( $rid, $data ) {
			global $wpdb;
            $table = $wpdb->prefix . $this->custom_price_table;
			$id = $wpdb->get_var( $wpdb->prepare( "SELECT id FROM {$table} WHERE room_id = %d AND checkin = %d;", $rid, $data[ 'checkin' ] ) );
			if ( $id ) {
				$wpdb->update(
                    $table,
                    array(
						'price' => $data[ 'price' ],
                        'number' => $data[ 'number' ],
                        'adult_price' => $data[ 'adult_price' ],
                        'child_price' => $data[ 'child_price' ],
                        'status' => $data[ 'status' ]
					),
					array( 'id' => $id ),
					array( '%d', '%d', '%d', '%d', '%s' ),
					array( '%d' )
				);
			} else {
				$wpdb->insert(
					$table,
					array(
						'room_id' => $rid,
						'checkin' => $data[ 'checkin' ],
						'checkout' => $data[ 'checkout' ],
						'price' => $data[ 'price' ],
                        'number' => $data[ 'number' ],
                        'adult_price' => $data[ 'adult_price' ],
                        'child_price' => $data[ 'child_price' ],
                        'status' => $data[ 'status' ]
					),
					array( '%d', '%d', '%d', '%d', '%d', '%d', '%d', '%s' ),
				);
			}
		}
		/**
		* Get room default data
		*/
		public function get_room_default_data( $rid ) {
			if ( ( ! empty( $rid ) ) && ( $this->room_post_type == get_post_type( $rid ) ) ) {
				$details = apply_filters( 'loftocean_get_room_details', array(), $rid );
				if ( isset( $details, $details[ 'roomSettings' ] ) ) {
					return $details[ 'roomSettings' ];
				}
			}
			return array_fill_keys( array( 'roomNumber', 'regularPrice', 'pricePerAdult', 'pricePerChild', 'weekendPricePerNight', 'weekendPricePerAdult', 'weekendPricePerChild' ), 0 );
		}
		/**
		* Check tables
		*/
		protected function check_tables() {
			global $wpdb;
            $table = $wpdb->prefix . $this->custom_price_table;
			$check_table_name = $wpdb->get_var( 'SHOW TABLES LIKE "' . $table . '"' );
			if ( $table != $check_table_name ) {
				$tables = $this->get_tables();
				foreach( $tables as $table ) {
					$wpdb->query( $table );
				}
				$this->update_exists_records();
			}
		}
		/*
		* Get tables
		*/
		protected function get_tables() {
			global $wpdb;
            $table = $table = $wpdb->prefix . $this->custom_price_table;
			$collate = $wpdb->has_cap( 'collation' ) ? $wpdb->get_charset_collate() : '';
			return array(
"CREATE TABLE {$table} (
  id bigint(20) unsigned NOT NULL auto_increment,
  room_id bigint(20) unsigned NOT NULL,
  checkin bigint(20) unsigned NOT NULL,
  checkout bigint(20) unsigned NOT NULL,
  number int(10) unsigned NOT NULL,
  price int(10) unsigned,
  status char(20) NOT NULL,
  adult_price int unsigned,
  child_price int unsigned,
  PRIMARY KEY (id)
) $collate;"
			);
		}
		/**
		* Update exists records
		*/
		public function update_exists_records() {
			global $wpdb;
			$order_table = $wpdb->prefix . 'loftocean_room_availability';
			$price_table = $wpdb->prefix . $this->custom_price_table;
			$rows = $wpdb->get_results( "SELECT * FROM {$order_table};", ARRAY_A );
			if ( \LoftOcean\is_valid_array( $rows ) ) {
				$rooms = array();
				foreach ( $rows as $row ) {
					$data = array();
					$should_insert = false;
					$rid = $row[ 'room_id' ];
					if ( isset( $rooms[ 'room' . $rid ] ) ) {
						$rooms[ 'room' . $rid ] = $this->get_room_default_data( $rid );
					}
					$prices = \LoftOcean\get_room_actual_prices( $rooms[ 'room' . $rid ], $row[ 'checkin' ] );



					// $wpdb->query( $wpdb->prepare( "INSERT INTO {$price_table} ( post_id, meta_key, meta_value ) VALUES ( %d, %s, %s )",
					// 	10, $metakey, $metavalue )
					// );
				}
			}
		}
	}
	new \LoftOcean\Room\Prices();
}
