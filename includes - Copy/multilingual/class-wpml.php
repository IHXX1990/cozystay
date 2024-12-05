<?php
namespace LoftOcean\Multilingual;
if ( ! class_exists( '\LoftOcean\Multilingual\WPML' ) ) {
    class WPML {
        /**
        * String current language from front
        */
        protected $current_language = '';
        /**
        * String defualt language from front
        */
        protected $default_language = '';
        /**
        * Construct function
        */
        public function __construct() {
            add_action( 'wp_loaded', array( $this, 'load_hooks' ) );
            add_action( 'wp_body_open', array( $this, 'load_front_hooks' ) );
        }
        /**
        * Init hooks
        */
        public function load_hooks() {
            if ( ( ! is_admin() ) || wp_doing_ajax() ) {
                $this->current_language = apply_filters( 'wpml_current_language', '' );
                $this->default_language = apply_filters( 'wpml_default_language', '' );

                $pages = apply_filters( 'loftocean_translate_page_options', array() );
                $attachment = apply_filters( 'loftocean_translate_attachment_options', array() );
                $terms = apply_filters( 'loftocean_translate_taxomony', array() );
                if ( is_array( $pages ) && ( count( $pages ) > 0 ) ) {
                    foreach ( $pages as $page ) {
                        add_filter( 'option_' . $page, array( $this, 'get_current_page_id' ) );
                    }
                }
                if ( is_array( $terms ) && ( count( $terms ) > 0 ) ) {
                    foreach( $terms as $filter ) {
                        add_filter( $filter, array( $this, 'get_current_taxonomy' ), 9999 );
                    }
                }
                if ( is_array( $attachment ) && ( count( $attachment ) > 0 ) ) {
                    foreach ( $attachment as $attach ) {
                        add_filter( $attach, array( $this, 'get_current_attachment_id' ) );
                    }
                }
                add_filter( 'loftocean_ajax_load_more_parameters', array( $this, 'make_ajax_translatable' ) );
                add_filter( 'loftocean_multilingual_get_post_id', array( $this, 'get_post_id' ), 10, 2 );
            }
        }
        /**
        * Init hooks
        */
        public function load_front_hooks() {
        	$forms = apply_filters( 'loftocean_translate_mc4wp_form', array() );
            if ( is_array( $forms ) && ( count( $forms ) > 0 ) ) {
                foreach ( $forms as $form ) {
            		add_filter( 'theme_mod_' . $form, array( $this, 'get_current_mc4wp_form' ) );
            	}
            }

            add_action( 'loftocean_search_form', array( $this, 'add_search_form_element' ) );
        }
        /**
        * Hook callback function to get current form id
        */
        public function get_current_mc4wp_form( $val ) {
        	return apply_filters( 'wpml_object_id', $val, 'mc4wp-form' );
        }
        /**
        * Make the pages translatable
        */
        public function get_current_page_id( $value, $option = '' ) {
            return empty( $value ) ? '' : apply_filters( 'wpml_object_id', $value, 'page' );
        }
        /**
        * Make the attachment translatable
        */
        public function get_current_attachment_id( $value ) {
            return empty( $value ) ? '' : apply_filters( 'wpml_object_id', $value, 'attachment' );
        }
        /**
        * Make the categories translatable
        */
        public function get_current_taxonomy( $tax ) {
            if ( ! empty( $tax ) ) {
                if ( is_array( $tax ) ) {
                    $new_tax = array_map( function( $t ) {
                        return $this->get_translated_category( $t );
                    }, $tax );
                    return array_filter( $new_tax );
                } else {
                    return $this->get_translated_category( $tax );
                }
            }
            return $tax;
        }
        /**
        * Make ajax request translatable
        */
        public function make_ajax_translatable( $data ) {
            return array_merge( array( 'lang' => $this->current_language ), $data );
        }
        /**
        * Get translated category
        */
        protected function get_translated_category( $tax ) {
            if ( is_numeric ( $tax ) ) {
                return apply_filters( 'wpml_object_id', $tax, 'category' );
            } else if ( is_string( $tax ) ) {
                $terms = get_terms( array( 'slug' => $tax, 'fields' => 'ids', 'taxonomy' => 'category', 'lang' => $this->default_language ) );
                if ( is_array( $terms ) && ( ! empty( $terms ) ) ) {
                    $new_id = apply_filters( 'wpml_object_id', $terms[0], 'category', true, $this->current_language );
                    if ( ! empty( $new_id ) ) {
                        $new_term = get_category( $new_id );
                        return $new_term->slug;
                    }
                }
            }
            return '';
        }
        /**
        * Add lang hide element for search form
        */
        public function add_search_form_element() {
            $url_format = apply_filters( 'wpml_setting', 0, 'language_negotiation_type' );
            if ( ! empty( $this->current_language ) && ( $this->default_language != $this->current_language ) /*&& ( 3 == $url_format ) */) : ?>
                <input type="hidden" name="lang" value="<?php echo esc_attr( $this->current_language ); ?>"><?php
            endif;
        }
        /**
        * Get post id
        */
        public function get_post_id( $pid, $post_type ) {
            return empty( $pid ) ? '' : apply_filters( 'wpml_object_id', $pid, $post_type, true );
        }
    }
    new WPML();
}
