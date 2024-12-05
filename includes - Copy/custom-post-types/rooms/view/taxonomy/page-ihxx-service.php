<div class="wrap">
    <h1 class="wp-heading-inline"><?php esc_html_e( 'نوع اتاق', 'loftocean' ); ?></h1>
    <hr class="wp-header-end">
    <form id="loftocean-room-ihxx-service-form" action="<?php echo esc_url( admin_url( 'edit.php?post_type=loftocean_room&page=loftocean_room_ihxx_services' ) ); ?>" method="POST">
        <div class="loftocean-room-ihxx-service-wrapper">
            <a href="#" class="loftocean-room-ihxx-service-add" data-current-index="0"><?php esc_html_e( 'افزودن', 'loftocean' ); ?></a>
        </div>
        <p class="submit loftocean-submit-button">
            <input type="submit" name="submit" id="submit" class="button button-primary" value="<?php esc_attr_e( 'Save Changes', 'loftocean' ); ?>" disabled>
            <span class="spinner" style="visibility: visible; float: none;"></span>
        </p>
        <input type="hidden" name="loftocean_room_ihxx_service_removed" value="" />
        <input type="hidden" name="loftocean_room_ihxx_services_settings_nonce" value="<?php echo esc_attr( wp_create_nonce( 'loftocean_room_ihxx_services_settings_nonce' ) ); ?>" />
    </form>
</div>
<script id="tmpl-loftocean-room-ihxx-service" type="text/html">
    <# data.list.forEach( function( item ) {
    var namePrefix = 'loftocean_room_ihxx_service[item' + ( data.index ++ ) + ']'; #>
    <div class="loftocean-room-ihxx-service-item">
        <h3><?php esc_html_e( 'نوع اتاق', 'loftocean' ); ?><span class="item-name"><# if ( item[ 'name' ] ) { #> - {{{ item.name }}}<# } #></span></h3>
        <a href="#" class="loftocean-room-ihxx-service-item-remove"><?php esc_html_e( 'حذف', 'loftocean' ); ?></a>
        <div class="loftocean-room-ihxx-service-controls-wrapper">
            <div class="controls-row">
                <div class="control-wrapper">
                    <label><?php esc_html_e( 'عنوان:', 'loftocean' ); ?></label>
                    <input name="{{{ namePrefix }}}[title]" class="loftocean-room-ihxx-service-title" type="text" value="{{{ item.name }}}">
                </div>
                <div class="control-wrapper">
                    <label><?php esc_html_e( 'قیمت:', 'loftocean' ); ?></label>
                    <input name="{{{ namePrefix }}}[price]" class="loftocean-room-ihxx-servie-price" type="number" value="{{{ item.price }}}">
                </div>
            </div>
         
    <hr>
    <div class="controls-row">
        <div class="control-wrapper">
            <label><?php esc_html_e( 'Set as obligatory?', 'loftocean' ); ?></label>
            <select class="obligatory-service" name="{{{ namePrefix }}}[obligatory]">
                <option value="yes"<# if ( 'yes' == item[ 'obligatory' ] ) { #> selected<# } #>><?php esc_html_e( 'Yes', 'loftocean' ); ?></option>
                <option value=""<# if ( '' == item[ 'obligatory' ] ) { #> selected<# } #>><?php esc_html_e( 'No', 'loftocean' ); ?></option>
            </select>
        </div>
    </div>
    <input type="hidden" class="service-item-id-hidden" name="{{{ namePrefix }}}[id]" value="{{{ item.term_id }}}" readonly />
    </div>
    </div><#
    } ); #>
</script>

<script id="tmpl-loftocean-room-ihxx-service-custom-time-slot" type="text/template">
    <div class="multi-items-wrapper">
        <input name="{{{ data.namePrefix }}}[custom_effective_time_slot][{{{ data.index }}}][start]" class="fullwidth date-picker" type="text" value="" autocomplete="off">
        <span class="field-text">-</span>
        <input name="{{{ data.namePrefix }}}[custom_effective_time_slot][{{{ data.index }}}][end]" class="fullwidth date-picker" type="text" value="" autocomplete="off">
        <a href="#" class="add-custom-effective-time-slot"><?php esc_html_e( 'افزودن', 'loftocean' ); ?></a>
        <a href="#" class="delete-custom-effective-time-slot"><?php esc_html_e( 'Delete', 'loftocean' ); ?></a>
    </div>
</script
