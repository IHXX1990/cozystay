<?php
namespace LoftOcean\Multilingual;

if ( ! class_exists( '\LoftOcean\Multilingual\Polylang' ) ) {
    class Polylang {
        /**
        * String current language from front
        */
        protected $current_language = '';
        /**
        * String defualt language from front
        */
        protected $default_language = '';
        public function __construct() {
            add_action( 'wp_loaded', array( $this, 'load_hooks' ) );
            add_action( 'wp_body_open', array( $this, 'load_front_hooks' ) );
        }
        /**
        * Init hooks
        */
        public function load_hooks() {
            if ( ( ! is_admin() ) || wp_doing_ajax() ) {
                $this->current_language = pll_current_language( 'slug' );
                $this->default_language = pll_default_language( 'slug' );
                if ( ! empty( $this->current_language ) && ! empty( $this->default_language ) && ( $this->default_language != $this->current_language ) ) {
                    $options = apply_filters( 'loftocean_translate_page_options', array( 'page_on_front' ) );
                    $terms = apply_filters( 'loftocean_translate_taxomony', array() );

                    add_filter( 'loftocean_ajax_load_more_parameters', array( $this, 'make_ajax_translatable' ) );
                    if ( is_array( $options ) && ( count( $options ) > 0 ) ) {
                        foreach( $options as $option ) {
                            add_filter( 'option_' . $option, array( $this, 'get_current_page_id' ), 9999, 2 );
                        }
                    }
                    if ( is_array( $terms ) && ( count( $terms ) > 0 ) ) {
                        foreach( $terms as $filter ) {
                            add_filter( $filter, array( $this, 'get_current_taxonomy' ), 9999 );
                        }
                    }
                }
                add_filter( 'loftocean_multilingual_get_post_id', array( $this, 'get_post_id' ), 10, 2 );
            }
        }
        /**
        * Make the pages translatable
        */
        public function get_current_page_id( $value, $option ) {
            return empty( $value ) ? '' : pll_get_post( $value, $this->current_language );
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
                return pll_get_term( $tax, $this->current_language );
            } else if ( is_string( $tax ) ) {
                $terms = get_terms( array( 'slug' => $tax, 'fields' => 'ids', 'taxonomy' => 'category', 'lang' => $this->default_language ) );
                if ( is_array( $terms ) ) {
                    $new_id = pll_get_term( $terms[0], $this->current_language );
                    if ( ! empty( $new_id ) ) {
                        $new_term = get_category( $new_id );
                        return $new_term->slug;
                    }
                }
            }
            return '';
        }
        /**
        * Front hooks only
        */
        public function load_front_hooks() {
            $mods = apply_filters( 'loftocean_translate_mc4wp_form', array() );
            add_filter( 'option_mc4wp_default_form_id', array( $this, 'get_current_mc4wp_form' ) );
            add_filter( 'loftocean_mc4wp_form_id', array( $this, 'get_current_mc4wp_form' ) );
            add_filter( 'loftocean_search_url', array( $this, 'search_url' ) );
            add_action( 'loftocean_search_form', array( $this, 'add_search_form_element' ) );
            if ( is_array( $mods ) && ( count( $mods ) > 0 ) ) {
                foreach ( $mods as $mod ) {
                    add_filter( 'theme_mod_' . $mod, array( $this, 'get_current_mc4wp_form' ) );
                }
            }
        }
        /**
        * Hook callback function to get current form id
        */
        public function get_current_mc4wp_form( $val ) {
            $current_settings = apply_filters( 'loftocean_translate_mc4wp_forms', array() );
            if ( is_array( $current_settings ) && isset( $current_settings['default'] ) && ( $val == $current_settings['default'] ) ) {
                return empty( $current_settings[ $this->current_language ] ) ? $val : $current_settings[ $this->current_language ];
            }
            return $val;
        }
        /**
        * Add lang hide element for search form
        */
        public function add_search_form_element() {
            if ( ! empty( $this->current_language ) && ( $this->current_language != $this->default_language ) ) : ?>
                <input type="hidden" name="lang" value="<?php echo esc_attr( $this->current_language ); ?>"><?php
            endif;
        }
        /**
        * Search url
        */
        public function search_url( $url ) {
            $pll = PLL();

            if ( $pll instanceof PLL_Frontend ) {
                return $pll->links_model->using_permalinks ? $pll->curlang->search_url : $pll->links_model->home;
            }
            return $url;
        }
        /**
        * Get the translated post id
        */
        public function get_post_id( $pid, $post_type = '' ) {
             return empty( $pid ) ? '' : pll_get_post( $pid, $this->current_language );
        }
    }
    new Polylang();
}
