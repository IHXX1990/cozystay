<?php
namespace LoftOcean\Elementor;
/**
 * Elementor Widget Mini Cart Button
 */
class Widget_Mini_Cart extends \LoftOcean\Elementor_Widget_Base {
	/**
	 * Get widget name.
	 * @access public
	 *
	 * @return string Widget name.
	 */
	public function get_name() {
		return apply_filters( 'loftocean_elementor_widget_name', 'loftoceanminicart', array( 'id' => 'mini-cart' ) );
	}
	/**
	 * Get widget title.
	 * @access public
	 * @return string Widget title.
	 */
	public function get_title() {
		return esc_html__( 'Mini Cart', 'loftocean' );
	}
	/**
	 * Get widget icon.
	 * @access public
	 *
	 * @return string Widget icon.
	 */
	public function get_icon() {
		return 'eicon-cart';
	}
	/**
	 * Get widget categories.
	 * @access public
	 *
	 * @return array Widget categories.
	 */
	public function get_categories() {
		return array( 'loftocean-theme-category' );
	}
	/**
	 * Get widget keywords.
	 * Retrieve the list of keywords the widget belongs to.
	 * @return array Widget keywords.
	 */
	public function get_keywords() {
		return array( 'mini cart', 'cart' );
	}
	/**
	* Get JavaScript dependency to render this widget
	* @return array of script handler
	*/
	public function get_script_depends() {
		return array();
	}
	/**
	* Get style dependency to render this widget
	* @return array of style handler
	*/
	public function get_style_depends() {
		return array();
	}
	/**
	 * Register widget controls.
	 * Adds different input fields to allow the user to change and customize the widget settings.
	 * @access protected
	 */
	protected function register_controls() {
		$this->start_controls_section( 'style_section', array(
			'label' => __( 'General', 'loftocean' ),
			'tab' => \Elementor\Controls_Manager::TAB_STYLE
		) );
        $this->add_control( 'font_size', array(
			'label' => esc_html__( 'Font Size', 'loftocean' ),
			'type' => \Elementor\Controls_Manager::SLIDER,
			'range' => array( 'px' => array( 'max' => 150, 'step' => 1, 'min' => 1 ) ),
			'render_type' => 'ui',
			'separator' => 'before',
			'selectors' => array( '{{WRAPPER}} .cart-icon:before' => 'font-size: {{SIZE}}px;' )
		) );
        $this->add_control( 'dropdown_color_scheme', array(
            'label' => esc_html__( 'Drop Down Color', 'loftocean' ),
            'type' => \Elementor\Controls_Manager::SELECT,
            'default' => 'dropdown-dark',
            'options' => array(
                'dropdown-light' => esc_html__( 'Light', 'loftocean' ),
                'dropdown-dark' => esc_html__( 'Dark', 'loftocean' ),
            )
        ) );
		$this->end_controls_section();
	}
	/**
	* Written in PHP and used to generate the final HTML.
    * @access protected
	*/
	protected function render() {
        $settings = $this->get_settings_for_display();
        $this->add_render_attribute( 'wrapper', 'class', array( 'cs-mini-cart', $settings[ 'dropdown_color_scheme' ] ) );

        $cart_url = function_exists( '\wc_get_cart_url' ) ? \wc_get_cart_url() : \WC()->cart->get_cart_url(); ?>
        <div <?php $this->print_render_attribute_string( 'wrapper' ); ?>>
            <a class="cart-contents" href="<?php echo esc_url( $cart_url ); ?>" title="<?php esc_attr_e( 'View your shopping cart', 'loftocean' ); ?>">
				<span class="cart-icon"></span>
			</a><?php
            if ( ! \Elementor\Plugin::$instance->editor->is_edit_mode() ) : ?>
                <div class="widget woocommerce widget_shopping_cart">
                    <div class="widget_shopping_cart_content"><?php woocommerce_mini_cart(); ?></div>
                </div><?php
            endif; ?>
        </div><?php
    }
    /**
	* Render button widget output in the editor.
	* Written as a Backbone JavaScript template and used to generate the live preview.
	* @access protected
	*/
	protected function content_template() {
        $cart_url = function_exists( '\wc_get_cart_url' ) ? \wc_get_cart_url() : \WC()->cart->get_cart_url(); ?>
        <#
        view.addRenderAttribute( 'wrapper', 'class', [ 'cs-mini-cart', settings[ 'dropdown_color_scheme' ] ] );
        #>
        <div {{{ view.getRenderAttributeString( 'wrapper' ) }}}>
            <a class="cart-contents" href="<?php echo esc_url( $cart_url ); ?>" title="<?php esc_attr_e( 'View your shopping cart', 'loftocean' ); ?>">
				<span class="cart-icon"></span>
			</a>
        </div><?php
    }
}
