<?php
namespace LoftOcean\Utils;
if ( ! class_exists( '\LoftOcean\Utils\Icon_Manager' ) ) {
	class Icon_Manager {
		/**
		* Object current class instance
		*/
		public static $_instance = false;
		/**
		* Construct function
		*/
		public function __construct() {
			add_action( 'wp_head', array( $this, 'preload_icon_assets' ), 1 );
			add_action( 'loftocean_enqueue_icons', array( $this, 'enqueue_icons' ) );
			add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_scripts' ) );
            add_filter( 'loftocean_get_flaticons', array( $this, 'get_icons' ), 10, 1 );
        }
        /**
        * Enqueue icon assets
        */
        public function enqueue_icons() {
            add_action( 'admin_footer', array( $this, 'load_template' ) );
		}
        /**
        * Enqueue scripts
        */
        public function enqueue_scripts() {
            wp_enqueue_style( 'loftocean-flaticons', LOFTOCEAN_ASSETS_URI . 'libs/flaticon-font/flaticon_hotel.min.css', array(), LOFTOCEAN_ASSETS_VERSION );
        }
		/**
		* Preload icon assets
		*/
		public function preload_icon_assets() {
			wp_print_styles( 'loftocean-flaticons' );
		}
        /**
        * Load html template
        */
        public function load_template() {
            wp_enqueue_style( 'loftocean-flaticons', LOFTOCEAN_ASSETS_URI . 'libs/flaticon-font/flaticon_hotel.min.css', array(), LOFTOCEAN_ASSETS_VERSION ); ?>

            <div class="loftocean-flaticons-libaray" style="display: none;">
                <div class="loftocean-lightbox-content">
                    <div class="loftocean-lightbox-header">
                        <div class="loftocean-lightbox-title-area">
                        	<span class="loftocean-lightbox-title"><?php esc_html_e( 'Icon Library', 'loftocean' ); ?></span>
                        </div>
                        <div class="loftocean-lightbox-close-area">
                            <span class="loftocean-lightbox-close"><?php esc_html_e( 'Close', 'loftocean' ); ?></span>
                        </div>
                    </div>
                    <div class="loftocean-lightbox-main-content">
                        <div class="loftocean-lightbox-main-content-search">
                            <input placeholder="<?php esc_html_e( 'Filter by name...', 'loftocean' ); ?>">
                        </div>
                        <div class="loftocean-lightbox-icon-list"><?php
                            $icons = apply_filters( 'loftocean_get_flaticons', array() );
                            foreach ( $icons as $icon ) :
                                if ( empty( $icon ) ) continue;
                                $title = str_replace( '-', ' ', $icon );
                                $title = ucfirst( $title ); ?>
                                <div class="loftocean-lightbox-icon-item" filter="<?php echo esc_attr( strtolower( $icon ) ); ?>" title="<?php echo esc_attr( strtolower( $title ) ); ?>">
                                    <div class="loftocean-lightbox-icon-content">
                                        <i class="loftocean-flaticon flaticon flaticon-<?php echo esc_attr( $icon ); ?>"></i>
                                        <div class="loftocean-lightbox-icon-title"><?php echo esc_html( $title ); ?></div>
                                    </div>
                                </div><?php
                            endforeach; ?>
                        </div>
                    </div>
                    <div class="loftocean-lightbox-buttons-wrapper">
                        <button class="loftocean-lightbox-insert-button"><?php esc_html_e( 'Insert', 'loftocean' ); ?></button>
                    </div>
                </div>
            </div><?php
        }
        /**
        * Get flaticons
        */
        public function get_icons( $icons = array() ) {
            return array(
				"resort",
			    "resort-1",
			    "do-not-disturb",
			    "hotel-sign",
			    "resort-2",
			    "hotel",
			    "review",
			    "bedroom",
			    "hotel-1",
			    "guest-house",
			    "hotel-cart",
			    "key-card",
			    "reception",
			    "room-service",
			    "desk-bell",
			    "service",
			    "check-in",
			    "room-service-1",
			    "coffee",
			    "hotel-2",
			    "hotel-3",
			    "hotel-bell",
			    "food-service",
			    "room-service-2",
			    "customer-service",
			    "sunrise",
			    "around",
			    "world",
			    "destination",
			    "signpost",
			    "travel-map",
			    "landscape",
			    "location",
			    "passport",
			    "suitcase",
			    "plane-ticket",
			    "flight",
			    "luggage",
			    "vacation",
			    "travel-bag",
			    "travel-bag-1",
			    "traveling",
			    "airplane",
			    "suitcase-1",
			    "map",
			    "bed",
			    "bed-1",
			    "bed-2",
			    "bed-3",
			    "bed-4",
			    "bed-5",
			    "bed-6",
			    "bed-7",
			    "beds",
			    "bed-8",
			    "bed-9",
			    "single-bed",
			    "account",
			    "user",
			    "user-1",
			    "user-2",
			    "users",
			    "friends",
			    "group",
			    "towel",
			    "mug",
			    "sandwich",
			    "breakfast",
			    "breakfast-1",
			    "breakfast-2",
			    "croissant",
			    "breakfast-3",
			    "breakfast-4",
			    "dinner",
			    "breakfast-5",
			    "croissant-1",
			    "food-tray",
			    "breakfast-6",
			    "food-tray-1",
			    "room-service-3",
			    "croissant-2",
			    "coffee-cup",
			    "parking",
			    "pet-hotel",
			    "calendar",
			    "calendar-1",
			    "calendar-2",
			    "calendar-3",
			    "car",
			    "car-1",
			    "rental-car",
			    "charging",
			    "electric-car",
			    "protection",
			    "car-wash",
			    "parking-1",
			    "calendar-4",
			    "car-key",
			    "route",
			    "energy",
			    "shopping-cart",
			    "shopping-cart-1",
			    "shopping-cart-2",
			    "trolley",
			    "bag",
			    "add-to-cart",
			    "hotel-4",
			    "sofa",
			    "air-conditioner",
			    "reception-1",
			    "booked",
			    "ac",
			    "air",
			    "ac-1",
			    "air-conditioner-1",
			    "air-conditioner-2",
			    "air-conditioner-3",
			    "wifi",
			    "wifi-1",
			    "wireless-connection",
			    "air-conditioner-4",
			    "wifi-signal",
			    "wifi-2",
			    "wifi-signal-1",
			    "wifi-3",
			    "wifi-4",
			    "wifi-connection",
			    "wifi-5",
			    "wifi-6",
			    "refrigerator",
			    "fridge",
			    "refrigerator-1",
			    "fridge-1",
			    "fridge-2",
			    "snowflake",
			    "gym",
			    "gym-1",
			    "training",
			    "weights",
			    "stationary-bike",
			    "yoga-pose",
			    "lotus",
			    "stationary-bike-1",
			    "fitness",
			    "barbell",
			    "treadmill",
			    "aromatherapy",
			    "aromatherapy-1",
			    "massage",
			    "essential-oil",
			    "aromatherapy-2",
			    "massage-1",
			    "spa",
			    "aromatherapy-3",
			    "shower",
			    "shower-1",
			    "bathtub",
			    "bathtub-1",
			    "bathtub-2",
			    "bathtub-3",
			    "bathtub-4",
			    "shower-2",
			    "bathtub-5",
			    "bathroom",
			    "bathing",
			    "swimming-pool",
			    "swimming-pool-1",
			    "ladder",
			    "swimming-pool-2",
			    "pool",
			    "pool-1",
			    "hot-tub",
			    "sun-bath",
			    "washing-machine",
			    "laundry-service",
			    "area",
			    "area-1",
			    "maximize",
			    "full-screen",
			    "resize",
			    "text-area",
			    "moka-pot",
			    "espresso",
			    "kettle",
			    "baby-crib",
			    "crib",
			    "hair-dryer",
			    "slippers",
			    "shampoo",
			    "towel-1",
			    "towel-2",
			    "towel-3",
			    "bicycle",
			    "goal",
			    "barbeque",
			    "barbecue",
			    "bar-counter",
			    "cocktail",
			    "cocktail-1",
			    "cocktail-2",
			    "veterinary",
			    "disabilities",
			    "wheelchair",
			    "hot",
			    "sunny",
			    "weather",
			    "television",
			    "landscape-1",
			    "landscape-2",
			    "signpost-1",
			    "biodiversity",
			    "biodiversity-1",
			    "gluten-free",
			    "salad",
			    "plant-based",
			    "tuxedo",
			    "clothes",
			    "open-sign",
			    "24-hours",
			    "reserved",
			    "snowboard",
			    "ski-equipment",
			    "ski-lift",
			    "alpine",
			    "goggles",
			    "snorkel",
			    "serving-dish",
			    "wine",
			    "safe-box",
			    "strongbox",
			    "charity",
			    "win",
			    "shield",
			    "payment-protection",
			    "credit-card-payment",
			    "circular-clock",
			    "calendar-5",
			    "presentation",
			    "board",
			    "printer"
    	    );
        }
		/**
		* Instantiate class to make sure only once instance exists
		*/
		public static function _instance() {
			if ( false === self::$_instance ) {
				self::$_instance = new Icon_Manager();
			}
			return self::$_instance;
		}
    }
    add_action( 'loftocean_load_core_modules', array( 'LoftOcean\Utils\Icon_Manager', '_instance' ) );
}
