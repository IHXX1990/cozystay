<?php
namespace LoftOcean\Room;

if ( ! class_exists( '\LoftOcean\Room\Availability' ) ) {
	class Availability {
		/**
		* Room post type
		*/
		protected $room_post_type = 'loftocean_room';
		/*
		* Availability table name
		*/
		protected $availability_table = 'loftocean_room_availability';
		/*
		* Order table name
		*/
		protected $order_table = 'loftocean_room_order';
		/*
		* Construction function
		*/
		public function __construct() {
			if ( is_admin() ) {
				$this->check_tables();
			}
			add_action( 'rest_api_init', array( $this, 'register_rest_api' ) );
			add_action( 'update_room_order', array( $this, 'update_room_order' ), 10, 2 );

			add_filter( 'loftocean_get_current_month_availability', array( $this, 'get_current_month_availability' ), 10, 2 );
			add_filter( 'loftocean_get_unavailable_rooms', array( $this, 'get_unavailable_rooms' ), 99, 2 );
            add_filter( 'loftocean_room_get_total_price', array( $this, 'get_total_price' ), 10, 6 );
			add_filter( 'loftocean_get_room_reservation_data', array( $this, 'get_room_reservation_data' ), 10, 4 );
		}
		/*
		* Get current month availability data
		* @param array data
		* @param int room id
		*/
		public function get_current_month_availability( $data, $rid ) {
			return $this->get_availability_monthly_data( $rid, date( 'm' ), date( 'Y' ) );
		}
		/*
		* Register REST APIs
		*/
		public function register_rest_api() {
			// Get room availability
			register_rest_route( 'loftocean/v1', '/get_room_availability/(?P<rid>.+)/(?P<start>.+)/(?P<end>.+)', array(
				'methods' 	=> 'GET',
				'permission_callback' => '__return_true',
				'callback' 	=> array( $this, 'get_room_availability' )
			) );
			register_rest_route( 'loftocean/v1', '/update_room_availability/(?P<rid>.+)/(?P<data>.+)', array(
				'methods' 	=> 'GET',
				'permission_callback' => '__return_true',
				'callback' 	=> array( $this, 'update_room_availability' )
			) );
		}
        /**
        * Update room order
        */
        public function update_room_order( $data, $status ) {
            if ( $data[ 'room_id' ] && ( $this->room_post_type == get_post_type( $data[ 'room_id' ] ) ) ) {
                global $wpdb;
                $row = $wpdb->get_row( $wpdb->prepare( "SELECT id, number, number_booked FROM {$wpdb->prefix}{$this->availability_table} WHERE room_id = %d AND checkin = %d;", $data[ 'room_id'], $data[ 'check_in' ] ), ARRAY_A );
                if ( \LoftOcean\is_valid_array( $row ) ) {
                    $is_valid = ( 'paid' == $status ? ( $row[ 'number' ] >= $row[ 'number_booked' ] + $data[ 'number' ] ) : ( $row[ 'number_booked' ] >= $data[ 'number' ] ) );
                    if ( $is_valid ) {
                        $wpdb->update(
                            $wpdb->prefix . $this->availability_table,
                            array(
                                'number_booked' => ( 'paid' == $status ? ( $row[ 'number_booked' ] + $data[ 'number' ] ) : ( $row[ 'number_booked' ] - $data[ 'number' ] ) )
                            ),
                            array( 'id' => $row[ 'id' ] ),
                            array( '%d' ),
                            array( '%d' )
                        );
                    }
                } else if ( 'paid' == $status ) {
                    $default_number = get_post_meta( $data[ 'room_id' ], 'loftocean_room_number', true );
                    if ( is_numeric( $default_number ) && ( $default_number >= $data[ 'number' ] ) ) {
						$prices = \LoftOcean\get_room_prices( $data[ 'room_id' ] );
						$has_weekend_night_price = ! empty( $prices[ 'weekend' ][ 'night' ] );
						$has_weekend_adult_price = ! empty( $prices[ 'weekend' ][ 'adult' ] );
						$has_weekend_child_price = ! empty( $prices[ 'weekend' ][ 'child' ] );
						$is_weekend = in_array( date( 'w', $data[ 'check_in' ] ), array( 5, 6 ) );

                        $wpdb->insert(
                            $wpdb->prefix . $this->availability_table,
                            array(
                                'room_id' => $data[ 'room_id' ],
                                'checkin' => $data[ 'check_in' ],
                                'checkout' => strtotime( '+1 day', $data[ 'check_in' ] ),
                                'price' => $has_weekend_night_price && $is_weekend ? $prices[ 'weekend' ][ 'night' ] : $prices[ 'regular' ][ 'night' ],
                                'number' => get_post_meta( $data[ 'room_id' ], 'loftocean_room_number', true ),
								'adult_price' => $has_weekend_adult_price && $is_weekend ? $prices[ 'weekend' ][ 'adult' ] : $prices[ 'regular' ][ 'adult' ],
								'child_price' => $has_weekend_child_price && $is_weekend ? $prices[ 'weekend' ][ 'child' ] : $prices[ 'regular' ][ 'child' ],
                                'status' => 'available',
                                'discount' => 100,
                                'number_booked' => $data[ 'number' ]
                            ),
                            array( '%d', '%d', '%d', '%d', '%d', '%d', '%d', '%s', '%d', '%d' ),
                        );
                    }
                }
            }
        }
		/**
		* Get room reservation data
		*/
		public function get_room_reservation_data( $data, $rid, $start, $end ) {
			return $this->get_room_availability( array( 'rid' => $rid, 'start' => $start, 'end' => $end ) );
		}
		/**
		* REST API get room availability for ajax request
		*/
		public function get_room_availability( $data ) {
			$rid = isset( $data[ 'rid' ] ) ? $data[ 'rid' ] : false;
			$start = isset( $data[ 'start' ] ) ? strtotime( $data[ 'start' ] ) : false;
			$end = isset( $data[ 'end' ] ) ? strtotime( $data[ 'end' ] ) : false;
			if ( ( ! $rid ) || ( ! $start ) || ( ! $end ) ) return false;

			$room_details = apply_filters( 'loftocean_get_room_details', array(), $rid );
			$has_details = \LoftOcean\is_valid_array( $room_details ) && \LoftOcean\is_valid_array( $room_details[ 'roomSettings' ] );

			$prices = \LoftOcean\get_room_prices( $rid );
			$has_weekend_night_price = ! empty( $prices[ 'weekend' ][ 'night' ] );
			$has_weekend_adult_price = ! empty( $prices[ 'weekend' ][ 'adult' ] );
			$has_weekend_child_price = ! empty( $prices[ 'weekend' ][ 'child' ] );

			$records = $this->get_availability_monthly_data( $rid, $start, $end );
			$times = array_column( $records, 'checkin' );
			$records = array_combine( $times, $records );
			$json_return = array();

			$special_prices = apply_filters( 'loftocean_room_get_special_prices', false, $rid );
			$has_special_prices = \LoftOcean\is_valid_array( $special_prices );

			for ( $i = max( $start, strtotime( date( 'Y-m-d' ) ) ); $i <= $end; $i ) {
				if ( isset( $records[ $i ] ) ) {
					$json_return[] = array(
						'id' => $i,
						'allDay' => true,
						'title' => 'Price ' . $records[ $i ][ 'price' ],
						'price' => $records[ $i ][ 'price' ],
						'start' => date( 'Y-m-d', $records[ $i ][ 'checkin' ] ),
						'end' => date( 'Y-m-d', $records[ $i ][ 'checkout' ] ),
						'status' => $records[ $i ][ 'status' ],
						'adult_price' => $records[ $i ][ 'adult_price' ],
						'child_price' => $records[ $i ][ 'child_price' ],
						'number' => $records[ $i ][ 'number' ],
						'available_number' => $records[ $i ][ 'number' ] - $records[ $i ][ 'number_booked' ],
						'special_price_rate' => $has_special_prices ? $this->get_special_price_rate( $special_prices, $i ) : 1
					);
				} else if ( $has_details ) {
					$is_weekend = in_array( date( 'w', $i ), array( 5, 6 ) );
					$json_return[] = array(
						'id' => $i,
						'allDay' => true,
						'title' => 'Price ' . $prices[ 'regular' ][ 'night' ],
						'price' => $has_weekend_night_price && $is_weekend ? $prices[ 'weekend' ][ 'night' ] : $prices[ 'regular' ][ 'night' ],
						'start' => date( 'Y-m-d', $i ),
						'end' => date( 'Y-m-d', strtotime('+1 day', $i ) ),
						'status' => 'available',
						'adult_price' => $has_weekend_adult_price && $is_weekend ? $prices[ 'weekend' ][ 'adult' ] : $prices[ 'regular' ][ 'adult' ],
						'child_price' => $has_weekend_child_price && $is_weekend ? $prices[ 'weekend' ][ 'child' ] : $prices[ 'regular' ][ 'child' ],
						'number' => $room_details[ 'roomSettings' ][ 'roomNumber' ],
						'available_number' => $room_details[ 'roomSettings' ][ 'roomNumber' ],
						'special_price_rate' => $has_special_prices ? $this->get_special_price_rate( $special_prices, $i ) : 1
					);
				}
				$i += LOFTICEAN_SECONDS_IN_DAY;
			}
			return $json_return;
		}
		/**
		* Get special price rate
		*/
		protected function get_special_price_rate( $list, $date ) {
			return \LoftOcean\get_special_price_rate( $list, $date );
		}
		/**
		* REST API update room availability data
		*/
		public function update_room_availability( $data ) {
			$rid = wp_unslash( $data[ 'rid' ] );
			$d = wp_unslash( $data[ 'data' ] );
			if ( ( ! empty( $rid ) ) && ( ! empty( $d ) ) ) {
				$d = base64_decode( $d );
				$d = json_decode( $d, true );
				if ( ! empty( $d ) ) {
					$start = $d[ 'checkin' ];
					$end = $d[ 'checkout' ];
					for( $i = $start; $i < $end; $i ) {
						$d[ 'checkin' ] = $i;
						$i += LOFTICEAN_SECONDS_IN_DAY;
						$d[ 'checkout' ] = $i;
						$this->update_availability_data( $rid, $d );
					}
				}
			}
			return array( 'updated' => true );
		}
		/**
		* Update availability database
		*/
		public function update_availability_data( $rid, $data ) {
			global $wpdb;
			$id = $wpdb->get_var( $wpdb->prepare( "SELECT id FROM {$wpdb->prefix}{$this->availability_table} WHERE room_id = %d AND checkin = %d;", $rid, $data[ 'checkin' ] ) );
			if ( $id ) {
				$wpdb->update(
					$wpdb->prefix . $this->availability_table,
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
					$wpdb->prefix . $this->availability_table,
					array(
						'room_id' => $rid,
						'checkin' => $data[ 'checkin' ],
						'checkout' => $data[ 'checkout' ],
						'price' => $data[ 'price' ],
                        'number' => $data[ 'number' ],
                        'adult_price' => $data[ 'adult_price' ],
                        'child_price' => $data[ 'child_price' ],
                        'status' => $data[ 'status' ],
						'discount' => 100,
						'number_booked' => 0
					),
					array( '%d', '%d', '%d', '%d', '%d', '%d', '%d', '%s', '%d', '%d' ),
				);
			}
		}
        /**
        * Get total price by given time range
        */
        public function get_total_price( $total, $room_id, $start, $end, $room_number = 1, $adult_number = 1, $child_number = 0 ) {
			if ( $this->room_post_type == get_post_type( $room_id ) ) {
				$details = apply_filters( 'loftocean_get_room_details', array(), $room_id );
	            if ( ! empty( $start ) && ! empty( $end ) ) {
					global $wpdb;
					$where = "lra.room_id = {$room_id} AND lra.checkin >= {$start} AND lra.checkin < {$end}";
					$results = $wpdb->get_results( "SELECT lra.checkin, lra.price, lra.status, lra.adult_price, lra.child_price FROM {$wpdb->prefix}{$this->availability_table} as lra WHERE {$where};", ARRAY_A );
					$custom_price = array_combine( array_column( $results, 'checkin' ), $results );
					$price_per_person = isset( $details[ 'roomSettings' ] ) && ( 'on' == $details[ 'roomSettings' ][ 'priceByPeople' ] );
					$room_number = absint( $room_number );
					$adult_number = absint( $adult_number );
					$child_number = absint( $child_number );
					$total = 0;

					$prices = \LoftOcean\get_room_prices( $room_id );
					$has_weekend_night_price = ! empty( $prices[ 'weekend' ][ 'night' ] );
					$has_weekend_adult_price = ! empty( $prices[ 'weekend' ][ 'adult' ] );
					$has_weekend_child_price = ! empty( $prices[ 'weekend' ][ 'child' ] );

					$special_prices = apply_filters( 'loftocean_room_get_special_prices', false, $room_id );
					$has_special_prices = \LoftOcean\is_valid_array( $special_prices );

					for ( $i = $start; $i < $end; $i += LOFTICEAN_SECONDS_IN_DAY ) {
						$is_weekend = in_array( date( 'w', $i ), array( 5, 6 ) );
						$current_rate = $has_special_prices ? $this->get_special_price_rate( $special_prices, $i ) : 1;
						if ( $price_per_person ) {
							$adult_single_price = isset( $custom_price[ $i ] )
								? ( 'unavailable' == $custom_price[ $i ][ 'status' ] ? 0 : ( empty( $custom_price[ $i ][ 'adult_price' ] ) ? 0 : $custom_price[ $i ][ 'adult_price' ] ) )
									: ( $has_weekend_adult_price && $is_weekend ? $prices[ 'weekend' ][ 'adult' ] : $prices[ 'regular' ][ 'adult' ] );
							$child_single_price = isset( $custom_price[ $i ] )
								? ( 'unavailable' == $custom_price[ $i ][ 'status' ] ? 0 : ( empty( $custom_price[ $i ][ 'child_price' ] ) ? 0 : $custom_price[ $i ][ 'child_price' ] ) )
									: ( $has_weekend_child_price && $is_weekend ? $prices[ 'weekend' ][ 'child' ] : $prices[ 'regular' ][ 'child' ] );
							$total += ( $adult_single_price * $adult_number + $child_single_price * $child_number ) * $current_rate;
						} else {
							$price_per_night = isset( $custom_price[ $i ] )
								? ( 'unavailable' == $custom_price[ $i ][ 'status' ] ? 0 : ( empty( $custom_price[ $i ][ 'price' ] ) ? 0 : $custom_price[ $i ][ 'price' ] ) )
									: ( $has_weekend_night_price && $is_weekend ? $prices[ 'weekend' ][ 'night' ] : $prices[ 'regular' ][ 'night' ] );
							$total += ( $price_per_night * $room_number ) * $current_rate;
						}
					}
	            }
			}
            return $total;
        }
		/*
		* Get room availability monthly
		* @param int room id
		* @param int month
		* @param int year
		*/
		public function get_availability_monthly_data( $rid, $start = '', $end = '' ) {
			if ( ! empty( $rid ) ) {
				global $wpdb;
 				$data = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM {$wpdb->prefix}{$this->availability_table} WHERE room_id = %d AND checkin >= %d AND checkin < %d;", $rid, $start, $end ), ARRAY_A );
				return \LoftOcean\is_valid_array( $data ) ? $data : array();
			}
			return array();
		}
		/**
		* Get unavailable rooms
		*/
		public function get_unavailable_rooms( $rooms, $data ) {
			global $wpdb;
			if ( \LoftOcean\is_valid_array( $data ) ) {
				$where = empty( $data[ 'room-quantity' ] ) ? "status = 'unavailable'"
					: sprintf( "( ( lra.number - lra.number_booked ) < %d OR ( status = 'unavailable' ) )", $data[ 'room-quantity' ] );
				$where .= sprintf( ' AND checkin >= %d', ( isset( $data[ 'checkin' ] ) ? $data[ 'checkin' ] : strtotime( date( 'Y-m-d' ) ) ) );
				if ( isset( $data[ 'checkout' ] ) ) {
					$where .= sprintf( ' AND checkin < %d', $data[ 'checkout' ] );
				}
				$results = $wpdb->get_results( "SELECT room_id FROM {$wpdb->prefix}{$this->availability_table} as lra WHERE {$where} GROUP BY room_id;", ARRAY_A );
				$excluded_ids = array_map( function( $item ) {
					return $item[ 'room_id' ];
				}, $results );

				if ( ! empty( $data[ 'room-quantity' ] ) ) {
					$where = sprintf( 'checkin >= %d', ( isset( $data[ 'checkin' ] ) ? $data[ 'checkin' ] : strtotime( date( 'Y-m-d' ) ) ) );
					if ( isset( $data[ 'checkout' ] ) ) {
						$where .= sprintf( ' AND checkin < %d', $data[ 'checkout' ] );
					}
					$results = $wpdb->get_results( "SELECT room_id FROM {$wpdb->prefix}{$this->availability_table} as lra WHERE {$where} GROUP BY room_id;", ARRAY_A );
					$modified_room_ids = array_map( function( $item ) {
						return $item[ 'room_id' ];
					}, $results );

					$query_args = array( 'posts_per_page' => -1, 'offset' => 0, 'post_type' => 'loftocean_room', 'fields' => 'ids', 'post_status' => ( is_user_logged_in() ? array( 'publish', 'private' ) : 'publish' ) );
	                if ( \LoftOcean\is_valid_array( $modified_room_ids ) ) {
	                	$query_args[ 'post__not_in' ] = $modified_room_ids;
	                }

	               $query_args[ 'meta_query' ] = array( array(
                        'key' => 'loftocean_room_number',
                        'value' => $data[ 'room-quantity' ],
                        'compare' => '<',
                        'type' => 'NUMERIC'
                    ) );

					$results = new \WP_Query( $query_args );
					if ( \LoftOcean\is_valid_array( $results->posts ) ) {
						foreach ( $results->posts as $pid ) {
							array_push( $excluded_ids, $pid );
						}
					}
				}

				return array_unique( $excluded_ids );
			}
			return array();
		}
		/**
		* Check tables
		*/
		protected function check_tables() {
			global $wpdb;
			$table_name = $wpdb->get_var( 'SHOW TABLES LIKE "' . $wpdb->prefix . $this->availability_table . '"' );
			if ( $wpdb->prefix . $this->availability_table != $table_name ) {
				$tables = $this->get_tables();
				foreach( $tables as $table ) {
					$wpdb->query( $table );
				}
			}
		}
		/*
		* Get tables
		*/
		protected function get_tables() {
			global $wpdb;
			$collate = $wpdb->has_cap( 'collation' ) ? $wpdb->get_charset_collate() : '';
			return array(
"CREATE TABLE {$wpdb->prefix}{$this->availability_table} (
  id bigint(20) unsigned NOT NULL auto_increment,
  room_id bigint(20) unsigned NOT NULL,
  checkin bigint(20) unsigned NOT NULL,
  checkout bigint(20) unsigned NOT NULL,
  number int(10) unsigned NOT NULL,
  price int(10) unsigned,
  status char(20) NOT NULL,
  number_booked int(10) unsigned NOT NULL,
  allow_full_day char(5) NOT NULL,
  discount int(3) unsigned NOT NULL DEFAULT 100,
  adult_number int unsigned,
  adult_price int unsigned,
  child_number int unsigned,
  child_price int unsigned,
  PRIMARY KEY (id)
) $collate;",
"CREATE TABLE {$wpdb->prefix}{$this->order_table} (
  id bigint(20) unsigned NOT NULL auto_increment,
  order_id bigint(20) unsigned NOT NULL,
  type char(50) NOT NULL DEFAULT 'normal',
  room_id bigint(20) unsigned NOT NULL,
  checkin bigint(20) unsigned NOT NULL,
  checkout bigint(20) unsigned NOT NULL,
  adult_number int unsigned,
  adult_price int unsigned,
  child_number int unsigned,
  child_price int unsigned,
  discount int(3) unsigned DEFAULT 100,
  status char(50) NOT NULL,
  user_id bigint(20) unsigned NOT NULL,
  created bigint(20) unsigned NOT NULL,
  wc_order_id bigint(20) unsigned NULL,
  total bigint(20) unsigned,
  raw_data text NULL,
  PRIMARY KEY (id)
) $collate;"
			);
		}
	}
	new Availability();
}
