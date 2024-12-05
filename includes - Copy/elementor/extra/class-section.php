<?php
namespace LoftOcean\Elementor\Extra;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}
class Section {
    /**
    * Construct function
    */
    public function __construct() {
		add_action( 'elementor/element/section/section_layout/after_section_end', array( $this, 'layout_controls' ), 10, 2 );
        add_action( 'elementor/element/section/section_background_overlay/before_section_start', array( $this, 'animation_controls' ), 10, 2 );

        add_action( 'elementor/element/after_add_attributes', array( $this, 'background_image' ), 99 );
    }
	/**
	* Section layout controls
	*/
	public function layout_controls( $element, $args ) {
		$element->start_controls_section( 'theme_layout_section', array(
			'label' => esc_html__( '[CozyStay] Layout', 'loftocean' ),
			'type' => \Elementor\Controls_Manager::SECTION,
			'tab' => \Elementor\Controls_Manager::TAB_LAYOUT,
		) );
		$element->add_control( 'fullwidth', array(
			'label'	=> esc_html__( 'Stretch Section to Full Width', 'loftocean' ),
			'description' => esc_html__( 'Enable this option to set the section width to Full Width with CSS, while preserving space on both sides of the section content.', 'loftocean' ),
			'type' => \Elementor\Controls_Manager::SWITCHER,
			'prefix_class' => '',
            'default' => '',
            'label_on' => 'on',
            'label_off' => 'off',
            'return_value' => 'cs-section-content-fullwidth'
		) );
		$element->add_responsive_control( 'alignment', array(
            'label'	=> esc_html__( 'Default Text Alignment in This Section', 'loftocean' ),
			'type' => \Elementor\Controls_Manager::CHOOSE,
            'options' => array(
				'left' => array(
					'title' => esc_html__( 'Left', 'loftocean' ),
					'icon' => 'eicon-text-align-left'
				),
				'center' => array(
					'title' => esc_html__( 'Center', 'loftocean' ),
					'icon' => 'eicon-text-align-center',
				),
				'right' => array(
					'title' => esc_html__( 'Right', 'loftocean' ),
					'icon' => 'eicon-text-align-right',
				)
			),
			'prefix_class' => 'elementor%s-align-',
			'separator' => 'before',
			'label_block' => true,
			'default' => '',
		) );
		$element->end_controls_section();
	}
    /**
    * Section animition controls
    */
	public function animation_controls( $element, $args ) {
		$element->start_controls_section( 'theme_animation_section', array(
			'label' => esc_html__( '[CozyStay] Animation', 'loftocean' ),
			'type' => \Elementor\Controls_Manager::SECTION,
			'tab' => \Elementor\Controls_Manager::TAB_STYLE,
		) );

        $element->add_control( 'cs_element_parallax', array(
			'label'        => esc_html__( 'Parallax on scroll', 'woodmart' ),
			'description'  => esc_html__( 'Smooth element movement when you scroll the page to create beautiful parallax effect.', 'loftocean' ),
			'type'         =>  \Elementor\Controls_Manager::SWITCHER,
			'default'      => '',
			'label_on'     => esc_html__( 'On', 'loftocean' ),
			'label_off'    => esc_html__( 'Off', 'loftocean' ),
			'return_value' => 'parallax-on-scroll',
			'render_type'  => 'template',
			'prefix_class' => 'cs-',
		) );

		$element->add_control( 'cs_scroll_y', array(
			'label'        => esc_html__( 'Y axis translation', 'loftocean' ),
			'type'         =>  \Elementor\Controls_Manager::TEXT,
			'default'      => 80,
			'render_type'  => 'template',
            'prefix_class' => 'cs_scroll_y_',
			'condition'    => array( 'cs_element_parallax' => array( 'parallax-on-scroll' ) )
		) );

		$element->end_controls_section();
	}
    /**
    * Background image
    */
    public function background_image( $element ) {
        if ( 'section' === $element->get_name() ) {
            $settings = $element->get_settings_for_display();
            if ( 'parallax-on-scroll' == $settings[ 'cs_element_parallax' ] ) {
                $element->add_render_attribute( '_wrapper', 'data-cs-parallax-y', $settings[ 'cs_scroll_y' ] );
                if ( 'classic' === $settings[ 'background_background' ] && ! empty( $settings[ 'background_image' ][ 'url' ] ) ) {
                    $element->add_render_attribute( '_wrapper', 'style', 'background-image: none;' );
                    $element->add_render_attribute( '_wrapper', 'data-cs-background-image', $settings[ 'background_image' ][ 'url' ] );
                }
            }
        }
    }
}
new \LoftOcean\Elementor\Extra\Section();
